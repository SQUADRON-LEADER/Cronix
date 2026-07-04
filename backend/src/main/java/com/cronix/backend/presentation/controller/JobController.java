package com.cronix.backend.presentation.controller;

import com.cronix.backend.application.service.JobService;
import com.cronix.backend.domain.model.Job;
import com.cronix.backend.presentation.dto.PaginatedResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Endpoints for submitting and managing individual background job runs")
public class JobController {

    private final JobService jobService;

    @GetMapping
    @Operation(summary = "Get a paginated, sorted, and filtered list of jobs")
    public ResponseEntity<PaginatedResponseDto<Job>> getAllJobs(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "search", required = false) String search
    ) {
        Page<Job> jobPage = jobService.getPaginatedJobs(page, limit, sortBy, sortOrder, search);
        
        PaginatedResponseDto<Job> response = PaginatedResponseDto.<Job>builder()
                .data(jobPage.getContent())
                .total(jobPage.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(jobPage.getTotalPages())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a single job by ID")
    public ResponseEntity<Job> getJobById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping
    @Operation(summary = "Submit a new background job to execute")
    public ResponseEntity<Job> submitJob(@RequestBody Job job) {
        return ResponseEntity.ok(jobService.submitJob(job));
    }

    @PostMapping("/{id}/retry")
    @Operation(summary = "Manually trigger a retry for a failed or cancelled job")
    public ResponseEntity<Job> retryJob(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(jobService.retryJob(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending or running job")
    public ResponseEntity<Job> cancelJob(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(jobService.cancelJob(id));
    }

    @PostMapping("/{id}/requeue")
    @Operation(summary = "Manually requeue an existing job")
    public ResponseEntity<Job> requeueJob(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(jobService.requeueJob(id));
    }
}
