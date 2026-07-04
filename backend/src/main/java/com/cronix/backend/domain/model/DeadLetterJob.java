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
public class DeadLetterJob {
    private UUID id;
    private UUID originalJobId;
    private UUID queueId;
    private String queueName; // display utility
    private UUID projectId;
    private String projectName; // display utility
    private String jobName;
    private String error;
    private int attempts;
    private Instant failedAt;
    private Map<String, Object> payload;
    private boolean canRetry;
}
