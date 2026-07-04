package com.cronix.backend.infrastructure.worker;

import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobClaimer {

    private final JobRepository jobRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<JobEntity> claimJob(UUID queueId, UUID workerId) {
        Optional<JobEntity> nextJob = jobRepository.findNextJobToClaim(queueId);
        
        if (nextJob.isPresent()) {
            JobEntity job = nextJob.get();
            job.setStatus("running");
            job.setWorkerId(workerId);
            job.setStartedAt(Instant.now());
            job.setAttempts(job.getAttempts() + 1);
            job.setUpdatedAt(Instant.now());
            
            JobEntity saved = jobRepository.save(job);
            log.info("Worker {} atomically claimed job {}", workerId, saved.getId());
            return Optional.of(saved);
        }
        
        return Optional.empty();
    }
}
