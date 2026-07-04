package com.cronix.backend.presentation.controller;

import com.cronix.backend.application.service.QueueService;
import com.cronix.backend.domain.model.Queue;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/queues")
@RequiredArgsConstructor
@Tag(name = "Queues", description = "Endpoints for managing job queues and execution settings")
public class QueueController {

    private final QueueService queueService;

    @GetMapping
    @Operation(summary = "Get list of all queues")
    public ResponseEntity<List<Queue>> getAllQueues() {
        return ResponseEntity.ok(queueService.getAllQueues());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a single queue by ID")
    public ResponseEntity<Queue> getQueueById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(queueService.getQueueById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new job queue")
    public ResponseEntity<Queue> createQueue(@RequestBody Queue queue) {
        return ResponseEntity.ok(queueService.createQueue(queue));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing queue's configuration")
    public ResponseEntity<Queue> updateQueue(
            @PathVariable("id") UUID id,
            @RequestBody Queue queue
    ) {
        return ResponseEntity.ok(queueService.updateQueue(id, queue));
    }

    @PostMapping("/{id}/pause")
    @Operation(summary = "Pause a job queue, stopping new claims")
    public ResponseEntity<Queue> pauseQueue(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(queueService.pauseQueue(id));
    }

    @PostMapping("/{id}/resume")
    @Operation(summary = "Resume a paused job queue")
    public ResponseEntity<Queue> resumeQueue(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(queueService.resumeQueue(id));
    }

    @PostMapping("/{id}/drain")
    @Operation(summary = "Drain a queue, letting active jobs complete but claiming no new ones")
    public ResponseEntity<Queue> drainQueue(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(queueService.drainQueue(id));
    }
}
