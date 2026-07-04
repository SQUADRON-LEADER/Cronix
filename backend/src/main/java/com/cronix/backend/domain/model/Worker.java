package com.cronix.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Worker {
    private UUID id;
    private String name;
    private String status; // online, offline, busy, error, draining
    private List<UUID> queues;
    private List<String> queuesNames; // display utility
    private Job currentJob; // job currently being executed
    private int jobsCompleted;
    private int jobsFailed;
    private Instant lastHeartbeat;
    private long uptime; // in seconds
    private double cpuUsage;
    private double memoryUsage;
    private String version;
    private Map<String, Object> metadata;
}
