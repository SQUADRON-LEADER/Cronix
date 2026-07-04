package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.Job;
import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.entity.QueueEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.ProjectRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import com.cronix.backend.presentation.exception.BadRequestException;
import com.cronix.backend.presentation.exception.ResourceNotFoundException;
import com.cronix.backend.presentation.mapper.JobMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final QueueRepository queueRepository;
    private final ProjectRepository projectRepository;
    private final JobMapper jobMapper;

    @Transactional(readOnly = true)
    public Page<Job> getPaginatedJobs(int page, int limit, String sortBy, String sortOrder, String search) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(direction, sortBy);
        }

        Pageable pageable = PageRequest.of(page - 1, limit, sort);

        Specification<JobEntity> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("status")), likePattern),
                        cb.like(cb.lower(root.get("errorMessage")), likePattern)
                ));
            }
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<JobEntity> entities = jobRepository.findAll(spec, pageable);
        return entities.map(this::enrichAndMap);
    }

    @Transactional(readOnly = true)
    public Job getJobById(UUID id) {
        JobEntity entity = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        return enrichAndMap(entity);
    }

    @Transactional
    public Job submitJob(Job job) {
        QueueEntity queue = queueRepository.findById(job.getQueueId())
                .orElseThrow(() -> new ResourceNotFoundException("Queue not found: " + job.getQueueId()));

        JobEntity entity = jobMapper.toEntity(job);
        entity.setQueueId(queue.getId());
        
        if (entity.getStatus() == null) {
            entity.setStatus("queued");
        }
        if (entity.getAttempts() == 0) {
            entity.setAttempts(0);
        }
        if (entity.getMaxAttempts() == 0) {
            entity.setMaxAttempts(queue.getRetryMaxAttempts());
        }
        if (entity.getPriority() == 0) {
            entity.setPriority(queue.getPriority());
        }

        JobEntity saved = jobRepository.save(entity);
        log.info("Submitted job {} to queue {}", saved.getId(), queue.getName());
        return enrichAndMap(saved);
    }

    @Transactional
    public Job retryJob(UUID id) {
        JobEntity entity = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));

        if (!"failed".equalsIgnoreCase(entity.getStatus()) && !"cancelled".equalsIgnoreCase(entity.getStatus())) {
            throw new BadRequestException("Only failed or cancelled jobs can be retried");
        }

        entity.setStatus("queued");
        entity.setAttempts(0);
        entity.setErrorMessage(null);
        entity.setScheduledAt(null);
        entity.setStartedAt(null);
        entity.setCompletedAt(null);
        entity.setDuration(null);

        JobEntity saved = jobRepository.save(entity);
        log.info("Job {} has been reset for manual retry", saved.getId());
        return enrichAndMap(saved);
    }

    @Transactional
    public Job cancelJob(UUID id) {
        JobEntity entity = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));

        if ("completed".equalsIgnoreCase(entity.getStatus()) || "failed".equalsIgnoreCase(entity.getStatus())) {
            throw new BadRequestException("Cannot cancel a completed or failed job");
        }

        entity.setStatus("cancelled");
        entity.setCompletedAt(Instant.now());
        
        JobEntity saved = jobRepository.save(entity);
        log.info("Job {} cancelled", saved.getId());
        return enrichAndMap(saved);
    }

    @Transactional
    public Job requeueJob(UUID id) {
        JobEntity entity = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));

        entity.setStatus("queued");
        entity.setScheduledAt(null);
        entity.setStartedAt(null);
        entity.setCompletedAt(null);
        entity.setDuration(null);
        entity.setErrorMessage(null);

        JobEntity saved = jobRepository.save(entity);
        log.info("Job {} requeued", saved.getId());
        return enrichAndMap(saved);
    }

    private Job enrichAndMap(JobEntity entity) {
        Job domain = jobMapper.toDomain(entity);
        
        queueRepository.findById(entity.getQueueId()).ifPresent(q -> {
            domain.setQueueName(q.getName());
            domain.setProjectId(q.getProjectId());
            projectRepository.findById(q.getProjectId()).ifPresent(p -> domain.setProjectName(p.getName()));
        });
        
        return domain;
    }
}
