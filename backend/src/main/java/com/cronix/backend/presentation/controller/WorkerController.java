package com.cronix.backend.presentation.controller;

import com.cronix.backend.application.service.WorkerService;
import com.cronix.backend.domain.model.Worker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/workers")
@RequiredArgsConstructor
@Tag(name = "Workers", description = "Endpoints for monitoring and controlling worker nodes")
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    @Operation(summary = "Get list of all registered worker nodes")
    public ResponseEntity<List<Worker>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get telemetry details of a single worker node by ID")
    public ResponseEntity<Worker> getWorkerById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @PostMapping("/{id}/restart")
    @Operation(summary = "Manually restart a worker node")
    public ResponseEntity<Worker> restartWorker(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(workerService.restartWorker(id));
    }

    @PostMapping("/{id}/drain")
    @Operation(summary = "Instruct a worker to drain and stop claiming new work")
    public ResponseEntity<Worker> drainWorker(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(workerService.drainWorker(id));
    }
}
