package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.Queue;
import com.cronix.backend.infrastructure.persistence.entity.ProjectEntity;
import com.cronix.backend.infrastructure.persistence.entity.QueueEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.ProjectRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import com.cronix.backend.presentation.exception.ResourceNotFoundException;
import com.cronix.backend.presentation.mapper.QueueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueRepository queueRepository;
    private final ProjectRepository projectRepository;
    private final JobRepository jobRepository;
    private final QueueMapper queueMapper;

    @Transactional(readOnly = true)
    public List<Queue> getAllQueues() {
        return queueRepository.findAll().stream()
                .map(this::enrichAndMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Queue getQueueById(UUID id) {
        QueueEntity entity = queueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue not found: " + id));
        return enrichAndMap(entity);
    }

    @Transactional
    public Queue createQueue(Queue queue) {
        if (!projectRepository.existsById(queue.getProjectId())) {
            throw new ResourceNotFoundException("Project not found: " + queue.getProjectId());
        }
        QueueEntity entity = queueMapper.toEntity(queue);
        if (entity.getStatus() == null) {
            entity.setStatus("active");
        }
        QueueEntity saved = queueRepository.save(entity);
        return enrichAndMap(saved);
    }

    @Transactional
    public Queue updateQueue(UUID id, Queue queue) {
        QueueEntity entity = queueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue not found: " + id));

        entity.setName(queue.getName());
        entity.setPriority(queue.getPriority());
        entity.setMaxConcurrency(queue.getMaxConcurrency());
        entity.setRetryPolicyType(queue.getRetryPolicyType());
        entity.setRetryBaseDelaySec(queue.getRetryBaseDelaySec());
        entity.setRetryMaxDelaySec(queue.getRetryMaxDelaySec());
        entity.setRetryMaxAttempts(queue.getRetryMaxAttempts());

        QueueEntity saved = queueRepository.save(entity);
        return enrichAndMap(saved);
    }

    @Transactional
    public Queue pauseQueue(UUID id) {
        return setStatus(id, "paused");
    }

    @Transactional
    public Queue resumeQueue(UUID id) {
        return setStatus(id, "active");
    }

    @Transactional
    public Queue drainQueue(UUID id) {
        return setStatus(id, "draining");
    }

    private Queue setStatus(UUID id, String status) {
        QueueEntity entity = queueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue not found: " + id));
        entity.setStatus(status);
        QueueEntity saved = queueRepository.save(entity);
        return enrichAndMap(saved);
    }

    private Queue enrichAndMap(QueueEntity entity) {
        Queue domain = queueMapper.toDomain(entity);
        
        // Enrich project name
        projectRepository.findById(entity.getProjectId())
                .ifPresent(proj -> domain.setProjectName(proj.getName()));

        // Enrich metrics
        UUID qId = entity.getId();
        long pending = jobRepository.countByQueueIdAndStatus(qId, "pending")
                + jobRepository.countByQueueIdAndStatus(qId, "queued")
                + jobRepository.countByQueueIdAndStatus(qId, "retrying");
        long processing = jobRepository.countByQueueIdAndStatus(qId, "running");
        long completed = jobRepository.countByQueueIdAndStatus(qId, "completed");
        long failed = jobRepository.countByQueueIdAndStatus(qId, "failed");

        domain.setJobsPending(pending);
        domain.setJobsProcessing(processing);
        domain.setJobsCompleted(completed);
        domain.setJobsFailed(failed);

        Double avgLatency = jobRepository.getAverageLatency(qId);
        domain.setAvgLatency(avgLatency != null ? avgLatency : 0.0);

        // Simple mock throughput based on completed jobs rate, or default to 0
        domain.setThroughput(completed > 0 ? Math.round((completed * 10.0) / 60.0) : 0.0);

        return domain;
    }
}
