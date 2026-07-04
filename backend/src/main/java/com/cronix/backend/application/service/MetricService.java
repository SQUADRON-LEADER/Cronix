package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.DashboardMetrics;
import com.cronix.backend.domain.model.MetricPoint;
import com.cronix.backend.infrastructure.persistence.entity.WorkerEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import com.cronix.backend.infrastructure.persistence.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MetricService {

    private final JobRepository jobRepository;
    private final WorkerRepository workerRepository;
    private final QueueRepository queueRepository;

    @Transactional(readOnly = true)
    public DashboardMetrics getDashboardMetrics() {
        long totalJobs = jobRepository.count();
        long completed = jobRepository.countByStatus("completed");
        long failed = jobRepository.countByStatus("failed");
        long running = jobRepository.countByStatus("running");
        long pending = jobRepository.countByStatus("pending") 
                     + jobRepository.countByStatus("queued") 
                     + jobRepository.countByStatus("retrying");

        long totalWorkers = workerRepository.count();
        long workersOnline = workerRepository.countByStatus("online") + workerRepository.countByStatus("busy");

        long totalQueues = queueRepository.count();
        long queuesActive = queueRepository.findAll().stream()
                .filter(q -> "active".equalsIgnoreCase(q.getStatus()))
                .count();

        Double avgLatencyVal = jobRepository.getAverageLatencyAll();
        double avgLatency = avgLatencyVal != null ? avgLatencyVal : 0.0;

        double successRate = (completed + failed > 0) 
                ? (completed * 100.0 / (completed + failed)) 
                : 100.0;

        // Calculate dynamic throughput: jobs completed in the last 5 minutes (rate per minute)
        Instant fiveMinsAgo = Instant.now().minus(5, ChronoUnit.MINUTES);
        long completedLast5Mins = jobRepository.countCompletedInInterval(fiveMinsAgo, Instant.now());
        double throughput = completedLast5Mins / 5.0;

        return DashboardMetrics.builder()
                .totalJobs(totalJobs)
                .jobsCompleted(completed)
                .jobsFailed(failed)
                .jobsPending(pending)
                .jobsRunning(running)
                .totalWorkers(totalWorkers)
                .workersOnline(workersOnline)
                .totalQueues(totalQueues)
                .queuesActive(queuesActive)
                .throughput(Math.max(throughput, 0.0))
                .avgLatency(avgLatency)
                .successRate(successRate)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MetricPoint> getThroughputSeries() {
        List<MetricPoint> points = new ArrayList<>();
        Instant now = Instant.now();
        
        // Return 24 hourly intervals
        for (int i = 23; i >= 0; i--) {
            Instant start = now.minus(i + 1, ChronoUnit.HOURS);
            Instant end = now.minus(i, ChronoUnit.HOURS);
            long count = jobRepository.countCompletedInInterval(start, end);
            points.add(new MetricPoint(end, (double) count));
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<MetricPoint> getLatencySeries() {
        List<MetricPoint> points = new ArrayList<>();
        Instant now = Instant.now();

        for (int i = 23; i >= 0; i--) {
            Instant start = now.minus(i + 1, ChronoUnit.HOURS);
            Instant end = now.minus(i, ChronoUnit.HOURS);
            Double avg = jobRepository.getAverageLatencyInInterval(start, end);
            points.add(new MetricPoint(end, avg != null ? avg : 0.0));
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<MetricPoint> getQueueDepthSeries() {
        List<MetricPoint> points = new ArrayList<>();
        Instant now = Instant.now();

        for (int i = 23; i >= 0; i--) {
            Instant start = now.minus(i + 1, ChronoUnit.HOURS);
            Instant end = now.minus(i, ChronoUnit.HOURS);
            long count = jobRepository.countQueuedInInterval(start, end);
            points.add(new MetricPoint(end, (double) count));
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getJobsByStatus() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Object[]> queryResult = jobRepository.countJobsGroupByStatus();
        
        for (Object[] row : queryResult) {
            Map<String, Object> map = new HashMap<>();
            map.put("status", row[0]);
            map.put("count", row[1]);
            result.add(map);
        }

        // Ensure common statuses are represented even if count is 0
        String[] statuses = {"completed", "running", "pending", "failed", "retrying"};
        for (String status : statuses) {
            boolean exists = result.stream().anyMatch(m -> status.equalsIgnoreCase((String) m.get("status")));
            if (!exists) {
                Map<String, Object> map = new HashMap<>();
                map.put("status", status);
                map.put("count", 0L);
                result.add(map);
            }
        }
        
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getJobsByQueue() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Object[]> queryResult = jobRepository.countJobsGroupByQueue();
        
        for (Object[] row : queryResult) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0]);
            map.put("value", row[1]);
            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWorkerHealth() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<WorkerEntity> workers = workerRepository.findAll();
        
        for (WorkerEntity worker : workers) {
            if ("online".equalsIgnoreCase(worker.getStatus()) || "busy".equalsIgnoreCase(worker.getStatus())) {
                long completed = jobRepository.findByStatusAndWorkerId("completed", worker.getId()).size();
                long failed = jobRepository.findByStatusAndWorkerId("failed", worker.getId()).size();
                
                double successRate = (completed + failed > 0)
                        ? (completed * 100.0 / (completed + failed))
                        : 100.0;
                
                Map<String, Object> map = new HashMap<>();
                map.put("name", worker.getName());
                map.put("value", Math.round(successRate));
                result.add(map);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHourlyJobsSeries() {
        List<Map<String, Object>> result = new ArrayList<>();
        Instant now = Instant.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:00").withZone(ZoneId.systemDefault());

        // Return last 12 hours completions and failures
        for (int i = 11; i >= 0; i--) {
            Instant start = now.minus(i + 1, ChronoUnit.HOURS);
            Instant end = now.minus(i, ChronoUnit.HOURS);
            
            long completed = jobRepository.countCompletedInInterval(start, end);
            long failed = jobRepository.countFailedInInterval(start, end);
            
            Map<String, Object> map = new HashMap<>();
            map.put("hour", formatter.format(end));
            map.put("completed", completed);
            map.put("failed", failed);
            result.add(map);
        }
        return result;
    }
}
