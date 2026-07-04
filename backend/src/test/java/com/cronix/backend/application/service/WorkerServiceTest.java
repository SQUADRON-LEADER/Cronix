package com.cronix.backend.application.service;

import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.entity.WorkerEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.WorkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkerServiceTest {

    @Mock
    private WorkerRepository workerRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private RetryEngine retryEngine;

    @InjectMocks
    private WorkerService workerService;

    @BeforeEach
    public void setup() {
        // Set values injected via @Value
        ReflectionTestUtils.setField(workerService, "staleThresholdMs", 30000);
    }

    @Test
    public void testCheckForStaleWorkers_StaleWorkersFound() {
        UUID workerId = UUID.randomUUID();
        
        WorkerEntity staleWorker = WorkerEntity.builder()
                .id(workerId)
                .name("crashed-worker-1")
                .status("online")
                .lastHeartbeat(Instant.now().minusSeconds(40))
                .build();

        JobEntity runningJob = JobEntity.builder()
                .id(UUID.randomUUID())
                .name("Process Transaction")
                .status("running")
                .workerId(workerId)
                .build();

        when(workerRepository.findStaleWorkers(any(Instant.class)))
                .thenReturn(List.of(staleWorker));
        when(jobRepository.findByStatusAndWorkerId("running", workerId))
                .thenReturn(List.of(runningJob));

        workerService.checkForStaleWorkers();

        // Worker status should be updated to offline
        assertEquals("offline", staleWorker.getStatus());
        verify(workerRepository, times(1)).save(staleWorker);
        
        // Stale jobs should be recovered
        verify(retryEngine, times(1)).handleJobFailure(eq(runningJob), anyString());
    }

    @Test
    public void testCheckForStaleWorkers_NoStaleWorkers() {
        when(workerRepository.findStaleWorkers(any(Instant.class)))
                .thenReturn(Collections.emptyList());

        workerService.checkForStaleWorkers();

        verify(workerRepository, never()).save(any(WorkerEntity.class));
        verify(retryEngine, never()).handleJobFailure(any(JobEntity.class), anyString());
    }
}
