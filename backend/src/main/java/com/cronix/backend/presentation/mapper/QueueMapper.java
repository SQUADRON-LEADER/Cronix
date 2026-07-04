package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.Queue;
import com.cronix.backend.infrastructure.persistence.entity.QueueEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QueueMapper {
    Queue toDomain(QueueEntity entity);
    QueueEntity toEntity(Queue domain);
}
