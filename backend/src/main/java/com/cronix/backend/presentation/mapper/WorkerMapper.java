package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.Worker;
import com.cronix.backend.infrastructure.persistence.entity.WorkerEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WorkerMapper {
    @Mapping(target = "queuesNames", ignore = true)
    @Mapping(target = "currentJob", ignore = true)
    @Mapping(target = "uptime", source = "uptimeSeconds")
    Worker toDomain(WorkerEntity entity);

    @Mapping(target = "uptimeSeconds", source = "uptime")
    WorkerEntity toEntity(Worker domain);
}
