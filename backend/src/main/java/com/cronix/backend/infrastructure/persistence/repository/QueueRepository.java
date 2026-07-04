package com.cronix.backend.infrastructure.persistence.repository;

import com.cronix.backend.infrastructure.persistence.entity.QueueEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QueueRepository extends JpaRepository<QueueEntity, UUID> {
    List<QueueEntity> findByProjectId(UUID projectId);
    long countByProjectId(UUID projectId);
}
