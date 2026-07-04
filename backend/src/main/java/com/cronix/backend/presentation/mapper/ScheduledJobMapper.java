package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.ScheduledJob;
import com.cronix.backend.infrastructure.persistence.entity.ScheduledJobEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScheduledJobMapper {
    @Mapping(target = "queueName", ignore = true)
    ScheduledJob toDomain(ScheduledJobEntity entity);
    
    ScheduledJobEntity toEntity(ScheduledJob domain);
}
