package com.cronix.backend.presentation.mapper;

import com.cronix.backend.domain.model.Notification;
import com.cronix.backend.infrastructure.persistence.entity.NotificationEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    Notification toDomain(NotificationEntity entity);
    NotificationEntity toEntity(Notification domain);
}
