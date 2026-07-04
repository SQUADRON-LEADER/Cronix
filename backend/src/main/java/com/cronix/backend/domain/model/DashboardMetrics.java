package com.cronix.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetrics {
    private long totalJobs;
    private long jobsCompleted;
    private long jobsFailed;
    private long jobsPending;
    private long jobsRunning;
    private long totalWorkers;
    private long workersOnline;
    private long totalQueues;
    private long queuesActive;
    private double throughput;
    private double avgLatency;
    private double successRate;
}
