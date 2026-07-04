package com.cronix.backend.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "dead_letter_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeadLetterJobEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "original_job_id", nullable = false)
    private UUID originalJobId;

    @Column(name = "queue_id", nullable = false)
    private UUID queueId;

    @Column(name = "job_name", nullable = false)
    private String jobName;

    @Column(name = "error_message", length = 4000)
    private String errorMessage;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "failed_at")
    private Instant failedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private Map<String, Object> payload;

    @Column(name = "can_retry", nullable = false)
    private boolean canRetry;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (failedAt == null) {
            failedAt = Instant.now();
        }
    }
}
