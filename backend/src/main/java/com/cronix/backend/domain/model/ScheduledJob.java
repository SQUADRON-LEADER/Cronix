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
public class ScheduledJob {
    private UUID id;
    private String name;
    private UUID queueId;
    private String queueName; // display utility
    private String cronExpression;
    private Map<String, Object> payload;
    private int priority;
    private int maxAttempts;
    private Instant lastRunAt;
    private Instant nextRunAt;
    private Instant createdAt;
    private Instant updatedAt;
}
