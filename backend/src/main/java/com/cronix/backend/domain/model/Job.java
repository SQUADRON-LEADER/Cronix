package com.cronix.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {
    private UUID id;
    private String name;
    private UUID queueId;
    private String queueName; // display utility
    private UUID projectId;
    private String projectName; // display utility
    private String status; // pending, queued, running, completed, failed, retrying, cancelled
    private int priority;
    private int attempts;
    private int maxAttempts;
    private Map<String, Object> payload;
    private Map<String, Object> result;
    private String error;
    
    private UUID workerId;
    private String workerName; // display utility
    
    private Instant scheduledAt;
    private Instant startedAt;
    private Instant completedAt;
    private Long duration; // execution time in ms
    private Instant createdAt;
    private Instant updatedAt;
}
