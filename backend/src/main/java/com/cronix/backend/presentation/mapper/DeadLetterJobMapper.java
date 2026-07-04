package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.DeadLetterJob;
import com.cronix.backend.infrastructure.persistence.entity.DeadLetterJobEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DeadLetterJobMapper {
    @Mapping(target = "queueName", ignore = true)
    @Mapping(target = "projectId", ignore = true)
    @Mapping(target = "projectName", ignore = true)
    @Mapping(target = "error", source = "errorMessage")
    DeadLetterJob toDomain(DeadLetterJobEntity entity);
    
    @Mapping(target = "errorMessage", source = "error")
    DeadLetterJobEntity toEntity(DeadLetterJob domain);
}
