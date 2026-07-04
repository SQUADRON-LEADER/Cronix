package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.Job;
import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JobMapper {
    @Mapping(target = "queueName", ignore = true)
    @Mapping(target = "projectName", ignore = true)
    @Mapping(target = "workerName", ignore = true)
    @Mapping(target = "error", source = "errorMessage")
    Job toDomain(JobEntity entity);

    @Mapping(target = "errorMessage", source = "error")
    JobEntity toEntity(Job domain);
}
