package com.cronix.backend.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "queues", uniqueConstraints = {@UniqueConstraint(columnNames = {"project_id", "name"})})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String status; // active, paused, draining

    @Column(nullable = false)
    private int priority;

    @Column(name = "max_concurrency", nullable = false)
    private int maxConcurrency;

    @Column(name = "retry_policy_type", nullable = false)
    private String retryPolicyType; // FIXED, LINEAR, EXPONENTIAL

    @Column(name = "retry_base_delay_sec", nullable = false)
    private int retryBaseDelaySec;

    @Column(name = "retry_max_delay_sec", nullable = false)
    private int retryMaxDelaySec;

    @Column(name = "retry_max_attempts", nullable = false)
    private int retryMaxAttempts;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
