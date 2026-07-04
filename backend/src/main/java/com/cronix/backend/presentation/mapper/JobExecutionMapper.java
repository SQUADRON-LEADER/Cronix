package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.ExecutionLog;
import com.cronix.backend.infrastructure.persistence.entity.JobExecutionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JobExecutionMapper {
    @Mapping(target = "duration", source = "durationMs")
    ExecutionLog toDomain(JobExecutionEntity entity);
    
    @Mapping(target = "durationMs", source = "duration")
    JobExecutionEntity toEntity(ExecutionLog domain);
}
