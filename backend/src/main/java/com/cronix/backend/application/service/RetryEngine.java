package com.cronix.backend.application.service;

import com.cronix.backend.infrastructure.persistence.entity.DeadLetterJobEntity;
import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.entity.QueueEntity;
import com.cronix.backend.infrastructure.persistence.repository.DeadLetterJobRepository;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class RetryEngine {

    private final JobRepository jobRepository;
    private final QueueRepository queueRepository;
    private final DeadLetterJobRepository deadLetterJobRepository;

    public Instant calculateNextRun(String policyType, int baseDelaySec, int maxDelaySec, int attempts) {
        long delaySec;
        switch (policyType.toUpperCase()) {
            case "LINEAR":
                delaySec = (long) baseDelaySec * attempts;
                break;
            case "EXPONENTIAL":
                delaySec = baseDelaySec * (long) Math.pow(2, attempts - 1);
                break;
            case "FIXED":
            default:
                delaySec = baseDelaySec;
                break;
        }

        // Cap at maximum delay
        long finalDelaySec = Math.min(delaySec, maxDelaySec);
        log.debug("Calculated backoff: policy={}, attempts={}, delay={}s", policyType, attempts, finalDelaySec);
        
        return Instant.now().plusSeconds(finalDelaySec);
    }

    @Transactional
    public void handleJobFailure(JobEntity job, String errorMessage) {
        QueueEntity queue = queueRepository.findById(job.getQueueId())
                .orElseThrow(() -> new IllegalStateException("Queue not found for job: " + job.getId()));

        int currentAttempts = job.getAttempts();
        int maxAttempts = job.getMaxAttempts();

        log.info("Job {} failed (attempt {}/{})", job.getId(), currentAttempts, maxAttempts);

        if (currentAttempts >= maxAttempts) {
            // Move to Dead Letter Queue (DLQ)
            moveToDlq(job, errorMessage);
        } else {
            // Backoff schedule for retry
            Instant nextRun = calculateNextRun(
                    queue.getRetryPolicyType(),
                    queue.getRetryBaseDelaySec(),
                    queue.getRetryMaxDelaySec(),
                    currentAttempts
            );

            job.setStatus("retrying");
            job.setScheduledAt(nextRun);
            job.setErrorMessage(errorMessage);
            jobRepository.save(job);
            
            log.info("Scheduled retry for job {} at {}", job.getId(), nextRun);
        }
    }

    private void moveToDlq(JobEntity job, String errorMessage) {
        log.warn("Moving job {} to Dead Letter Queue (DLQ). Max attempts exceeded.", job.getId());
        
        job.setStatus("failed");
        job.setErrorMessage(errorMessage);
        jobRepository.save(job);

        DeadLetterJobEntity dlqEntry = DeadLetterJobEntity.builder()
                .originalJobId(job.getId())
                .queueId(job.getQueueId())
                .jobName(job.getName())
                .errorMessage(errorMessage)
                .attempts(job.getAttempts())
                .failedAt(Instant.now())
                .payload(job.getPayload())
                .canRetry(true)
                .build();

        deadLetterJobRepository.save(dlqEntry);
    }
}
