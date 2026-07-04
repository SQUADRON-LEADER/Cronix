package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.User;
import com.cronix.backend.infrastructure.persistence.entity.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toDomain(UserEntity entity);
    UserEntity toEntity(User domain);
}
