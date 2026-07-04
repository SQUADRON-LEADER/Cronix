package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.DeadLetterJob;
import com.cronix.backend.infrastructure.persistence.entity.DeadLetterJobEntity;
import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.repository.DeadLetterJobRepository;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.ProjectRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import com.cronix.backend.presentation.exception.ResourceNotFoundException;
import com.cronix.backend.presentation.mapper.DeadLetterJobMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DlqService {

    private final DeadLetterJobRepository deadLetterJobRepository;
    private final JobRepository jobRepository;
    private final QueueRepository queueRepository;
    private final ProjectRepository projectRepository;
    private final DeadLetterJobMapper deadLetterJobMapper;

    @Transactional(readOnly = true)
    public List<DeadLetterJob> getAllDlqJobs() {
        return deadLetterJobRepository.findAll().stream()
                .map(this::enrichAndMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean retryDlqJob(UUID id) {
        DeadLetterJobEntity dlqEntity = deadLetterJobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DLQ entry not found: " + id));

        JobEntity job = jobRepository.findById(dlqEntity.getOriginalJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Original job not found for DLQ retry: " + dlqEntity.getOriginalJobId()));

        log.info("Manually retrying job {} from DLQ entry {}", job.getId(), id);
        
        // Reset and queue
        job.setStatus("queued");
        job.setAttempts(0);
        job.setErrorMessage(null);
        job.setScheduledAt(null);
        job.setStartedAt(null);
        job.setCompletedAt(null);
        job.setDuration(null);
        jobRepository.save(job);

        // Delete from DLQ
        deadLetterJobRepository.delete(dlqEntity);
        return true;
    }

    @Transactional
    public boolean deleteDlqJob(UUID id) {
        DeadLetterJobEntity dlqEntity = deadLetterJobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DLQ entry not found: " + id));

        log.info("Deleting DLQ entry {} (original job {})", id, dlqEntity.getOriginalJobId());
        deadLetterJobRepository.delete(dlqEntity);
        return true;
    }

    @Transactional
    public boolean requeueDlqJob(UUID id) {
        // Requeue and retry are functionally the same (sets original job status to 'queued' and clears DLQ)
        return retryDlqJob(id);
    }

    private DeadLetterJob enrichAndMap(DeadLetterJobEntity entity) {
        DeadLetterJob domain = deadLetterJobMapper.toDomain(entity);
        
        queueRepository.findById(entity.getQueueId()).ifPresent(q -> {
            domain.setQueueName(q.getName());
            domain.setProjectId(q.getProjectId());
            projectRepository.findById(q.getProjectId()).ifPresent(p -> {
                domain.setProjectName(p.getName());
            });
        });
        
        return domain;
    }
}
