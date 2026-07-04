package com.cronix.backend.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "workers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String status; // online, offline, busy, error, draining

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "worker_queues", joinColumns = @JoinColumn(name = "worker_id"))
    @Column(name = "queue_id")
    private List<UUID> queues;

    @Column(name = "last_heartbeat")
    private Instant lastHeartbeat;

    @Column(name = "uptime_seconds", nullable = false)
    private long uptimeSeconds;

    @Column(name = "cpu_usage", nullable = false)
    private double cpuUsage;

    @Column(name = "memory_usage", nullable = false)
    private double memoryUsage;

    private String version;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        lastHeartbeat = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
