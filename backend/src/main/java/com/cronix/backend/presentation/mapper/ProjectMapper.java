package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.Project;
import com.cronix.backend.infrastructure.persistence.entity.ProjectEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    Project toDomain(ProjectEntity entity);
    ProjectEntity toEntity(Project domain);
}
