package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.Worker;
import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.entity.WorkerEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import com.cronix.backend.infrastructure.persistence.repository.WorkerRepository;
import com.cronix.backend.presentation.exception.ResourceNotFoundException;
import com.cronix.backend.presentation.mapper.WorkerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final QueueRepository queueRepository;
    private final JobRepository jobRepository;
    private final RetryEngine retryEngine;
    private final WorkerMapper workerMapper;

    @Value("${app.worker.stale-threshold-ms}")
    private long staleThresholdMs;

    @Transactional(readOnly = true)
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll().stream()
                .map(this::enrichAndMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Worker getWorkerById(UUID id) {
        WorkerEntity entity = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found: " + id));
        return enrichAndMap(entity);
    }

    @Transactional
    public Worker registerOrHeartbeat(String name, String status, List<UUID> queues, double cpu, double memory, long uptime, String version, Map<String, Object> metadata) {
        WorkerEntity entity = workerRepository.findByName(name)
                .orElseGet(() -> {
                    log.info("Registering new worker: {}", name);
                    return WorkerEntity.builder().name(name).build();
                });

        entity.setStatus(status);
        entity.setQueues(queues);
        entity.setCpuUsage(cpu);
        entity.setMemoryUsage(memory);
        entity.setUptimeSeconds(uptime);
        entity.setVersion(version);
        entity.setMetadata(metadata);
        entity.setLastHeartbeat(Instant.now());

        WorkerEntity saved = workerRepository.save(entity);
        return enrichAndMap(saved);
    }

    @Transactional
    public Worker restartWorker(UUID id) {
        WorkerEntity entity = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found: " + id));
        entity.setStatus("online");
        entity.setLastHeartbeat(Instant.now());
        WorkerEntity saved = workerRepository.save(entity);
        log.info("Worker {} restarted manually", entity.getName());
        return enrichAndMap(saved);
    }

    @Transactional
    public Worker drainWorker(UUID id) {
        WorkerEntity entity = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found: " + id));
        entity.setStatus("draining");
        WorkerEntity saved = workerRepository.save(entity);
        log.info("Worker {} is now draining, it will stop claiming new jobs", entity.getName());
        return enrichAndMap(saved);
    }

    // Cron job checking for stale workers and recovering orphan jobs every 10 seconds
    @Scheduled(fixedRateString = "${app.worker.heartbeat-interval-ms:5000}")
    @Transactional
    public void checkForStaleWorkers() {
        Instant threshold = Instant.now().minusMillis(staleThresholdMs);
        List<WorkerEntity> staleWorkers = workerRepository.findStaleWorkers(threshold);

        if (staleWorkers.isEmpty()) {
            return;
        }

        log.warn("Found {} stale workers. Starting orphan job recovery.", staleWorkers.size());
        for (WorkerEntity worker : staleWorkers) {
            log.warn("Worker {} went offline (last heartbeat: {})", worker.getName(), worker.getLastHeartbeat());
            worker.setStatus("offline");
            workerRepository.save(worker);

            // Recover claimed jobs
            List<JobEntity> runningJobs = jobRepository.findByStatusAndWorkerId("running", worker.getId());
            for (JobEntity job : runningJobs) {
                log.warn("Recovering orphan job {} claimed by worker {}", job.getId(), worker.getName());
                retryEngine.handleJobFailure(job, "Worker node disconnected or crashed (heartbeat lost)");
            }
        }
    }

    private Worker enrichAndMap(WorkerEntity entity) {
        Worker domain = workerMapper.toDomain(entity);
        
        // Enrich queue names
        if (entity.getQueues() != null) {
            List<String> names = entity.getQueues().stream()
                    .map(qId -> queueRepository.findById(qId).map(q -> q.getName()).orElse(qId.toString()))
                    .collect(Collectors.toList());
            domain.setQueuesNames(names);
        }

        // Enrich current job running (if any)
        List<JobEntity> running = jobRepository.findByStatusAndWorkerId("running", entity.getId());
        if (!running.isEmpty()) {
            // Pick first
            JobEntity jobEntity = running.get(0);
            domain.setCurrentJob(jobRepository.findById(jobEntity.getId()).map(j -> jobRepository.findById(j.getId()).map(this::enrichJob).orElse(null)).orElse(null));
        }

        // Calculate jobs completed/failed stats
        domain.setJobsCompleted((int) jobRepository.findByStatusAndWorkerId("completed", entity.getId()).size());
        domain.setJobsFailed((int) jobRepository.findByStatusAndWorkerId("failed", entity.getId()).size());

        return domain;
    }

    private com.cronix.backend.domain.model.Job enrichJob(JobEntity entity) {
        com.cronix.backend.domain.model.Job domain = com.cronix.backend.domain.model.Job.builder()
                .id(entity.getId())
                .name(entity.getName())
                .queueId(entity.getQueueId())
                .status(entity.getStatus())
                .build();
        queueRepository.findById(entity.getQueueId()).ifPresent(q -> domain.setQueueName(q.getName()));
        return domain;
    }
}
