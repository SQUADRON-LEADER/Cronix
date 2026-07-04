package com.cronix.backend.infrastructure.persistence.repository;

import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, UUID>, JpaSpecificationExecutor<JobEntity> {
    List<JobEntity> findByStatus(String status);
    
    List<JobEntity> findByWorkerId(UUID workerId);
    
    long countByStatus(String status);
    
    long countByQueueId(UUID queueId);
    
    long countByQueueIdAndStatus(UUID queueId, String status);

    @Query("SELECT AVG(j.duration) FROM JobEntity j WHERE j.queueId = :queueId AND j.status = 'completed'")
    Double getAverageLatency(@Param("queueId") UUID queueId);

    @Query("SELECT AVG(j.duration) FROM JobEntity j WHERE j.status = 'completed'")
    Double getAverageLatencyAll();

    @Query("SELECT COUNT(j) FROM JobEntity j WHERE j.status = 'completed' AND j.completedAt >= :start AND j.completedAt < :end")
    long countCompletedInInterval(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(j) FROM JobEntity j WHERE j.status = 'failed' AND j.completedAt >= :start AND j.completedAt < :end")
    long countFailedInInterval(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT AVG(j.duration) FROM JobEntity j WHERE j.status = 'completed' AND j.completedAt >= :start AND j.completedAt < :end")
    Double getAverageLatencyInInterval(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(j) FROM JobEntity j WHERE j.status = 'queued' AND j.createdAt >= :start AND j.createdAt < :end")
    long countQueuedInInterval(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT j FROM JobEntity j WHERE j.status = :status AND j.workerId = :workerId")
    List<JobEntity> findByStatusAndWorkerId(@Param("status") String status, @Param("workerId") UUID workerId);

    // Postgres Atomic Claim query: SELECT FOR UPDATE SKIP LOCKED
    @Query(value = "SELECT * FROM jobs WHERE status = 'queued' AND queue_id = :queueId AND (scheduled_at IS NULL OR scheduled_at <= CURRENT_TIMESTAMP) ORDER BY priority DESC, created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED", nativeQuery = true)
    Optional<JobEntity> findNextJobToClaim(@Param("queueId") UUID queueId);

    // Dynamic search fallback if specifications are not used
    Page<JobEntity> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT COUNT(j) FROM JobEntity j WHERE j.queueId IN (SELECT q.id FROM QueueEntity q WHERE q.projectId = :projectId)")
    long countByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT j.status as status, COUNT(j) as count FROM JobEntity j GROUP BY j.status")
    List<Object[]> countJobsGroupByStatus();

    @Query("SELECT q.name as name, COUNT(j) as count FROM JobEntity j JOIN QueueEntity q ON j.queueId = q.id GROUP BY q.name")
    List<Object[]> countJobsGroupByQueue();

    @Query("SELECT j FROM JobEntity j WHERE j.status = 'running' AND j.updatedAt < :threshold")
    List<JobEntity> findOrphanJobs(@Param("threshold") Instant threshold);
}
