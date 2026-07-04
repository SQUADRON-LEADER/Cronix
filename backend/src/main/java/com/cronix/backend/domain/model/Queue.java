package com.cronix.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Queue {
    private UUID id;
    private String name;
    private UUID projectId;
    private String projectName; // display utility
    private String status; // active, paused, draining
    private int priority;
    private int maxConcurrency;
    
    // Retry Engine settings
    private String retryPolicyType; // FIXED, LINEAR, EXPONENTIAL
    private int retryBaseDelaySec;
    private int retryMaxDelaySec;
    private int retryMaxAttempts;
    
    private Instant createdAt;
    private Instant updatedAt;

    // Aggregated metrics from frontend expectations
    private long jobsPending;
    private long jobsProcessing;
    private long jobsCompleted;
    private long jobsFailed;
    private double throughput;
    private double avgLatency;
}
