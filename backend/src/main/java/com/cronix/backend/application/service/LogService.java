package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.ExecutionLog;
import com.cronix.backend.infrastructure.persistence.entity.JobExecutionEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobExecutionRepository;
import com.cronix.backend.presentation.mapper.JobExecutionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LogService {

    private final JobExecutionRepository jobExecutionRepository;
    private final JobExecutionMapper jobExecutionMapper;

    @Transactional(readOnly = true)
    public Page<ExecutionLog> getPaginatedLogs(int page, int limit, String sortBy, String sortOrder, String search) {
        Sort sort = Sort.by(Sort.Direction.DESC, "timestamp");
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(direction, sortBy);
        }

        Pageable pageable = PageRequest.of(page - 1, limit, sort);

        Specification<JobExecutionEntity> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("jobName")), likePattern),
                        cb.like(cb.lower(root.get("queueName")), likePattern),
                        cb.like(cb.lower(root.get("workerName")), likePattern),
                        cb.like(cb.lower(root.get("message")), likePattern),
                        cb.like(cb.lower(root.get("level")), likePattern)
                ));
            }
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return jobExecutionRepository.findAll(spec, pageable).map(jobExecutionMapper::toDomain);
    }
}
