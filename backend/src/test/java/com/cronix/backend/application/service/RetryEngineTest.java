package com.cronix.backend.application.service;

import com.cronix.backend.infrastructure.persistence.entity.DeadLetterJobEntity;
import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.entity.QueueEntity;
import com.cronix.backend.infrastructure.persistence.repository.DeadLetterJobRepository;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RetryEngineTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private QueueRepository queueRepository;

    @Mock
    private DeadLetterJobRepository deadLetterJobRepository;

    @InjectMocks
    private RetryEngine retryEngine;

    @Test
    public void testCalculateNextRun_Fixed() {
        Instant nextRun = retryEngine.calculateNextRun("FIXED", 5, 30, 2);
        long diffSec = ChronoUnit.SECONDS.between(Instant.now(), nextRun);
        
        // Assert that delay is approximately 5 seconds
        assertTrue(diffSec >= 4 && diffSec <= 6);
    }

    @Test
    public void testCalculateNextRun_Linear() {
        Instant nextRun = retryEngine.calculateNextRun("LINEAR", 5, 30, 3);
        long diffSec = ChronoUnit.SECONDS.between(Instant.now(), nextRun);
        
        // Linear backoff: base * attempts = 5 * 3 = 15 seconds
        assertTrue(diffSec >= 14 && diffSec <= 16);
    }

    @Test
    public void testCalculateNextRun_Exponential() {
        Instant nextRun = retryEngine.calculateNextRun("EXPONENTIAL", 2, 60, 4);
        long diffSec = ChronoUnit.SECONDS.between(Instant.now(), nextRun);
        
        // Exponential backoff: base * 2^(attempts-1) = 2 * 2^3 = 16 seconds
        assertTrue(diffSec >= 15 && diffSec <= 17);
    }

    @Test
    public void testCalculateNextRun_CappedAtMax() {
        Instant nextRun = retryEngine.calculateNextRun("EXPONENTIAL", 10, 30, 5);
        long diffSec = ChronoUnit.SECONDS.between(Instant.now(), nextRun);
        
        // Exponential calculation: 10 * 2^4 = 160 seconds. Capped at maxDelaySec = 30 seconds.
        assertTrue(diffSec >= 29 && diffSec <= 31);
    }

    @Test
    public void testHandleJobFailure_RetryScheduled() {
        UUID queueId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();

        QueueEntity queue = QueueEntity.builder()
                .id(queueId)
                .retryPolicyType("FIXED")
                .retryBaseDelaySec(10)
                .retryMaxDelaySec(60)
                .build();

        JobEntity job = JobEntity.builder()
                .id(jobId)
                .queueId(queueId)
                .attempts(1)
                .maxAttempts(3)
                .status("running")
                .build();

        when(queueRepository.findById(queueId)).thenReturn(Optional.of(queue));

        retryEngine.handleJobFailure(job, "Database timeout error");

        assertEquals("retrying", job.getStatus());
        assertEquals("Database timeout error", job.getErrorMessage());
        assertNotNull(job.getScheduledAt());
        
        verify(jobRepository, times(1)).save(job);
        verify(deadLetterJobRepository, never()).save(any(DeadLetterJobEntity.class));
    }

    @Test
    public void testHandleJobFailure_ExceededMaxAttempts_MovedToDlq() {
        UUID queueId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();

        QueueEntity queue = QueueEntity.builder()
                .id(queueId)
                .build();

        JobEntity job = JobEntity.builder()
                .id(jobId)
                .queueId(queueId)
                .attempts(3)
                .maxAttempts(3)
                .status("running")
                .name("Generate Report")
                .payload(null)
                .build();

        when(queueRepository.findById(queueId)).thenReturn(Optional.of(queue));

        retryEngine.handleJobFailure(job, "Fatal parsing error");

        assertEquals("failed", job.getStatus());
        assertEquals("Fatal parsing error", job.getErrorMessage());
        
        verify(jobRepository, times(1)).save(job);

        ArgumentCaptor<DeadLetterJobEntity> dlqCaptor = ArgumentCaptor.forClass(DeadLetterJobEntity.class);
        verify(deadLetterJobRepository, times(1)).save(dlqCaptor.capture());
        
        DeadLetterJobEntity dlqEntry = dlqCaptor.getValue();
        assertEquals(jobId, dlqEntry.getOriginalJobId());
        assertEquals(queueId, dlqEntry.getQueueId());
        assertEquals("Generate Report", dlqEntry.getJobName());
        assertEquals("Fatal parsing error", dlqEntry.getErrorMessage());
        assertEquals(3, dlqEntry.getAttempts());
        assertTrue(dlqEntry.isCanRetry());
    }
}
