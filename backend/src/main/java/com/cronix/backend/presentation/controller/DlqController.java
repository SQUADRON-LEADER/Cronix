package com.cronix.backend.presentation.controller;

import com.cronix.backend.application.service.DlqService;
import com.cronix.backend.domain.model.DeadLetterJob;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/dlq")
@RequiredArgsConstructor
@Tag(name = "Dead Letter Queue", description = "Endpoints for inspecting and retrying permanently failed jobs in the DLQ")
public class DlqController {

    private final DlqService dlqService;

    @GetMapping
    @Operation(summary = "Get list of all dead letter queue (DLQ) entries")
    public ResponseEntity<List<DeadLetterJob>> getAllDlqJobs() {
        return ResponseEntity.ok(dlqService.getAllDlqJobs());
    }

    @PostMapping("/{id}/retry")
    @Operation(summary = "Re-queue and retry a job from the DLQ")
    public ResponseEntity<Map<String, Boolean>> retryDlqJob(@PathVariable("id") UUID id) {
        boolean result = dlqService.retryDlqJob(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", result);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Permanently delete an entry from the DLQ")
    public ResponseEntity<Map<String, Boolean>> deleteDlqJob(@PathVariable("id") UUID id) {
        boolean result = dlqService.deleteDlqJob(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/requeue")
    @Operation(summary = "Manually requeue a job from the DLQ")
    public ResponseEntity<Map<String, Boolean>> requeueDlqJob(@PathVariable("id") UUID id) {
        boolean result = dlqService.requeueDlqJob(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", result);
        return ResponseEntity.ok(response);
    }
}
