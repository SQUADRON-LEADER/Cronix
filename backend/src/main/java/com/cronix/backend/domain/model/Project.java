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
public class Project {
    private UUID id;
    private String name;
    private String description;
    private String status; // active, inactive, archived
    private UUID organizationId;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Aggregated metrics from frontend expectations
    private long queueCount;
    private long jobCount;
    private long workerCount;
}
