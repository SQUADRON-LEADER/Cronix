package com.cronix.backend.infrastructure.persistence.repository;

import com.cronix.backend.infrastructure.persistence.entity.WorkerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkerRepository extends JpaRepository<WorkerEntity, UUID> {
    Optional<WorkerEntity> findByName(String name);
    
    @Query("SELECT w FROM WorkerEntity w WHERE w.status != 'offline' AND w.lastHeartbeat < :threshold")
    List<WorkerEntity> findStaleWorkers(@Param("threshold") Instant threshold);
    
    long countByStatus(String status);

    @Query("SELECT COUNT(DISTINCT w.id) FROM WorkerEntity w JOIN w.queues qId WHERE qId IN (SELECT q.id FROM QueueEntity q WHERE q.projectId = :projectId)")
    long countWorkersByProjectId(@Param("projectId") UUID projectId);
}
