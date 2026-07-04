package com.cronix.backend.infrastructure.persistence.repository;

import com.cronix.backend.infrastructure.persistence.entity.ScheduledJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduledJobRepository extends JpaRepository<ScheduledJobEntity, UUID> {
    @Query("SELECT s FROM ScheduledJobEntity s WHERE s.nextRunAt IS NULL OR s.nextRunAt <= :now")
    List<ScheduledJobEntity> findPendingScheduledJobs(@Param("now") Instant now);
}
