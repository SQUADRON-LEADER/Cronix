package com.cronix.backend.infrastructure.worker;

import com.cronix.backend.application.service.RetryEngine;
import com.cronix.backend.application.service.WorkerService;
import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.entity.JobExecutionEntity;
import com.cronix.backend.infrastructure.persistence.entity.QueueEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobExecutionRepository;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkerPoller {

    private final WorkerService workerService;
    private final QueueRepository queueRepository;
    private final JobRepository jobRepository;
    private final JobExecutionRepository jobExecutionRepository;
    private final JobClaimer jobClaimer;
    private final RetryEngine retryEngine;

    @Value("${app.worker.enabled}")
    private boolean enabled;

    @Value("${app.worker.name}")
    private String workerName;

    @Value("${app.worker.concurrency.core-pool-size}")
    private int corePoolSize;

    @Value("${app.worker.concurrency.max-pool-size}")
    private int maxPoolSize;

    @Value("${app.worker.concurrency.queue-capacity}")
    private int queueCapacity;

    private UUID workerId;
    private Instant startTime;
    private ThreadPoolTaskExecutor taskExecutor;
    private final AtomicInteger activeThreads = new AtomicInteger(0);
    private final Map<UUID, AtomicInteger> queueConcurrencyMap = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Worker polling is disabled on this node.");
            return;
        }

        workerId = UUID.randomUUID();
        startTime = Instant.now();

        // Initialize dedicated thread pool for job executions
        taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setCorePoolSize(corePoolSize);
        taskExecutor.setMaxPoolSize(maxPoolSize);
        taskExecutor.setQueueCapacity(queueCapacity);
        taskExecutor.setThreadNamePrefix("worker-execution-");
        taskExecutor.initialize();

        log.info("Started Cronix Worker: name={}, ID={}, corePoolSize={}, maxPoolSize={}", 
                workerName, workerId, corePoolSize, maxPoolSize);

        // Initial heartbeat check-in
        sendHeartbeat();
    }

    @PreDestroy
    public void shutdown() {
        if (!enabled) return;

        log.info("Shutting down worker {}. Draining active threads: {}", workerName, activeThreads.get());
        workerService.registerOrHeartbeat(workerName, "offline", Collections.emptyList(), 0, 0, 0, "1.0.0", Collections.emptyMap());
        
        if (taskExecutor != null) {
            taskExecutor.shutdown();
        }
    }

    @Scheduled(fixedRateString = "${app.worker.heartbeat-interval-ms:5000}")
    public void heartbeatSchedule() {
        if (!enabled) return;
        sendHeartbeat();
    }

    private void sendHeartbeat() {
        try {
            // Calculate JVM memory usage
            Runtime runtime = Runtime.getRuntime();
            double totalMem = runtime.totalMemory();
            double freeMem = runtime.freeMemory();
            double maxMem = runtime.maxMemory();
            double memoryUsage = ((totalMem - freeMem) / maxMem) * 100.0;

            // Simulated CPU usage
            double cpuUsage = 5.0 + Math.random() * 25.0;
            if (activeThreads.get() > 0) {
                cpuUsage += activeThreads.get() * 8.0;
            }
            cpuUsage = Math.min(cpuUsage, 100.0);

            long uptimeSeconds = Instant.now().getEpochSecond() - startTime.getEpochSecond();

            // Find all active queues in system to subscribe to
            List<QueueEntity> activeQueues = queueRepository.findAll().stream()
                    .filter(q -> "active".equalsIgnoreCase(q.getStatus()))
                    .toList();

            List<UUID> queueIds = activeQueues.stream().map(QueueEntity::getId).toList();

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("workerId", workerId.toString());
            metadata.put("activeThreads", activeThreads.get());
            metadata.put("maxThreads", maxPoolSize);

            String status = activeThreads.get() >= maxPoolSize ? "busy" : "online";

            workerService.registerOrHeartbeat(
                    workerName,
                    status,
                    queueIds,
                    cpuUsage,
                    memoryUsage,
                    uptimeSeconds,
                    "1.0.0",
                    metadata
            );
        } catch (Exception e) {
            log.error("Failed to send worker heartbeat: {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelayString = "${app.worker.poll-interval-ms:1000}")
    public void pollQueues() {
        if (!enabled) return;

        // Check overall thread capacity
        if (activeThreads.get() >= maxPoolSize) {
            log.debug("Worker is busy. Active threads: {}/{}", activeThreads.get(), maxPoolSize);
            return;
        }

        try {
            // Find all active queues in system
            List<QueueEntity> activeQueues = queueRepository.findAll().stream()
                    .filter(q -> "active".equalsIgnoreCase(q.getStatus()))
                    .toList();

            for (QueueEntity queue : activeQueues) {
                // Check if we exceed thread capacity mid-loop
                if (activeThreads.get() >= maxPoolSize) {
                    break;
                }

                UUID queueId = queue.getId();
                
                // Track concurrency per queue
                AtomicInteger runningOnQueue = queueConcurrencyMap.computeIfAbsent(queueId, k -> new AtomicInteger(0));
                
                if (runningOnQueue.get() >= queue.getMaxConcurrency()) {
                    log.debug("Queue {} concurrency limit reached: {}/{}", 
                            queue.getName(), runningOnQueue.get(), queue.getMaxConcurrency());
                    continue;
                }

                // Attempt to atomically claim next job
                Optional<JobEntity> claimed = jobClaimer.claimJob(queueId, workerId);
                
                if (claimed.isPresent()) {
                    JobEntity job = claimed.get();
                    
                    // Increment thread counts
                    activeThreads.incrementAndGet();
                    runningOnQueue.incrementAndGet();
                    
                    // Execute job asynchronously in thread pool
                    taskExecutor.execute(() -> executeJob(job, queue, runningOnQueue));
                }
            }
        } catch (Exception e) {
            log.error("Error occurred during queue polling: {}", e.getMessage(), e);
        }
    }

    private void executeJob(JobEntity job, QueueEntity queue, AtomicInteger runningOnQueue) {
        Instant jobStart = Instant.now();
        log.info("Starting execution of job {} ({}) on thread", job.getId(), job.getName());

        // Create initial execution log
        writeLog(job.getId(), job.getName(), queue.getId(), queue.getName(), "info", 
                "Job execution started by worker: " + workerName, null, null);

        String errorMessage = null;
        Map<String, Object> result = new HashMap<>();

        try {
            // Simulating job workload based on payload
            long workloadDurationMs = 1500; // Default execution time
            Map<String, Object> payload = job.getPayload();
            
            if (payload != null) {
                if (payload.containsKey("duration")) {
                    workloadDurationMs = ((Number) payload.get("duration")).longValue();
                }
                
                // Simulate intentional failures
                if (Boolean.TRUE.equals(payload.get("fail")) || "true".equalsIgnoreCase(String.valueOf(payload.get("fail")))) {
                    throw new RuntimeException("Simulated job execution error from payload request");
                }
            }

            // Sleep to simulate processing
            Thread.sleep(workloadDurationMs);

            // Populate success response
            result.put("status", "SUCCESS");
            result.put("processedAt", Instant.now().toString());
            result.put("completedBy", workerName);
            
            long duration = Instant.now().toEpochMilli() - jobStart.toEpochMilli();

            // Save job completion status
            job.setStatus("completed");
            job.setCompletedAt(Instant.now());
            job.setDuration(duration);
            job.setResult(result);
            jobRepository.save(job);

            writeLog(job.getId(), job.getName(), queue.getId(), queue.getName(), "info", 
                    String.format("Job completed successfully in %d ms", duration), (int) duration, result);
            
            log.info("Job {} completed successfully in {}ms", job.getId(), duration);

        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            errorMessage = "Job execution was interrupted during shutdown";
            log.error("Job {} interrupted: {}", job.getId(), ie.getMessage());
            
            long duration = Instant.now().toEpochMilli() - jobStart.toEpochMilli();
            writeLog(job.getId(), job.getName(), queue.getId(), queue.getName(), "warn", 
                    errorMessage, (int) duration, null);
            
            retryEngine.handleJobFailure(job, errorMessage);
        } catch (Exception e) {
            errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown execution exception";
            log.error("Job {} failed: {}", job.getId(), errorMessage);
            
            long duration = Instant.now().toEpochMilli() - jobStart.toEpochMilli();
            writeLog(job.getId(), job.getName(), queue.getId(), queue.getName(), "error", 
                    "Job execution failed: " + errorMessage, (int) duration, null);

            retryEngine.handleJobFailure(job, errorMessage);
        } finally {
            // Decrement active counters
            activeThreads.decrementAndGet();
            runningOnQueue.decrementAndGet();
        }
    }

    private void writeLog(UUID jobId, String jobName, UUID queueId, String queueName, 
                          String level, String message, Integer duration, Map<String, Object> metadata) {
        try {
            JobExecutionEntity executionLog = JobExecutionEntity.builder()
                    .jobId(jobId)
                    .jobName(jobName)
                    .queueId(queueId)
                    .queueName(queueName)
                    .workerId(workerId)
                    .workerName(workerName)
                    .level(level)
                    .message(message)
                    .timestamp(Instant.now())
                    .durationMs(duration)
                    .metadata(metadata)
                    .build();
            
            jobExecutionRepository.save(executionLog);
        } catch (Exception e) {
            log.error("Failed to write job execution log: {}", e.getMessage());
        }
    }
}
