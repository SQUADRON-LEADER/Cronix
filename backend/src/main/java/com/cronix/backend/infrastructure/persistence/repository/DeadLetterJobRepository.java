package com.cronix.backend.infrastructure.persistence.repository;

import com.cronix.backend.infrastructure.persistence.entity.DeadLetterJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DeadLetterJobRepository extends JpaRepository<DeadLetterJobEntity, UUID> {
}
