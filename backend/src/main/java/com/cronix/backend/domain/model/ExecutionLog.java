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
public class ExecutionLog {
    private UUID id;
    private UUID jobId;
    private String jobName;
    private UUID queueId;
    private String queueName;
    private UUID workerId;
    private String workerName;
    private String level; // info, warn, error, debug
    private String message;
    private Instant timestamp;
    private Integer duration; // in milliseconds
    private Map<String, Object> metadata;
}
