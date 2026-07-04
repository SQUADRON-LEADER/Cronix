package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.Project;
import com.cronix.backend.infrastructure.persistence.entity.ProjectEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.ProjectRepository;
import com.cronix.backend.infrastructure.persistence.repository.QueueRepository;
import com.cronix.backend.infrastructure.persistence.repository.WorkerRepository;
import com.cronix.backend.presentation.exception.ResourceNotFoundException;
import com.cronix.backend.presentation.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final QueueRepository queueRepository;
    private final JobRepository jobRepository;
    private final WorkerRepository workerRepository;
    private final ProjectMapper projectMapper;

    // Seeded Organization ID to fall back on if not provided
    private static final UUID DEFAULT_ORG_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::enrichAndMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Project getProjectById(UUID id) {
        ProjectEntity entity = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        return enrichAndMap(entity);
    }

    @Transactional
    public Project createProject(Project project) {
        ProjectEntity entity = projectMapper.toEntity(project);
        if (entity.getOrganizationId() == null) {
            entity.setOrganizationId(DEFAULT_ORG_ID);
        }
        if (entity.getStatus() == null) {
            entity.setStatus("active");
        }
        ProjectEntity saved = projectRepository.save(entity);
        return enrichAndMap(saved);
    }

    @Transactional
    public Project updateProject(UUID id, Project project) {
        ProjectEntity entity = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        
        entity.setName(project.getName());
        entity.setDescription(project.getDescription());
        if (project.getStatus() != null) {
            entity.setStatus(project.getStatus());
        }
        
        ProjectEntity saved = projectRepository.save(entity);
        return enrichAndMap(saved);
    }

    @Transactional
    public void deleteProject(UUID id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }

    private Project enrichAndMap(ProjectEntity entity) {
        Project domain = projectMapper.toDomain(entity);
        domain.setQueueCount(queueRepository.countByProjectId(entity.getId()));
        domain.setJobCount(jobRepository.countByProjectId(entity.getId()));
        domain.setWorkerCount(workerRepository.countWorkersByProjectId(entity.getId()));
        return domain;
    }
}
