package com.cronix.backend.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "job_executions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobExecutionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "job_name", nullable = false)
    private String jobName;

    @Column(name = "queue_id", nullable = false)
    private UUID queueId;

    @Column(name = "queue_name", nullable = false)
    private String queueName;

    @Column(name = "worker_id")
    private UUID workerId;

    @Column(name = "worker_name")
    private String workerName;

    @Column(nullable = false)
    private String level; // info, warn, error, debug

    @Column(nullable = false, length = 4000)
    private String message;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
