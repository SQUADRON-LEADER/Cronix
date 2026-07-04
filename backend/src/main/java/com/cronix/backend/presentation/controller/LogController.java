package com.cronix.backend.presentation.controller;

import com.cronix.backend.application.service.LogService;
import com.cronix.backend.domain.model.ExecutionLog;
import com.cronix.backend.presentation.dto.PaginatedResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
@Tag(name = "Logs", description = "Endpoints for fetching and querying execution logs")
public class LogController {

    private final LogService logService;

    @GetMapping
    @Operation(summary = "Get a paginated, sorted, and filtered list of job execution logs")
    public ResponseEntity<PaginatedResponseDto<ExecutionLog>> getAllLogs(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestParam(value = "sortBy", defaultValue = "timestamp") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "search", required = false) String search
    ) {
        Page<ExecutionLog> logPage = logService.getPaginatedLogs(page, limit, sortBy, sortOrder, search);
        
        PaginatedResponseDto<ExecutionLog> response = PaginatedResponseDto.<ExecutionLog>builder()
                .data(logPage.getContent())
                .total(logPage.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(logPage.getTotalPages())
                .build();
                
        return ResponseEntity.ok(response);
    }
}
