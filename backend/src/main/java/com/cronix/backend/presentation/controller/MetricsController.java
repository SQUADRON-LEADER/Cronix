package com.cronix.backend.presentation.controller;

import com.cronix.backend.application.service.MetricService;
import com.cronix.backend.domain.model.DashboardMetrics;
import com.cronix.backend.domain.model.MetricPoint;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/metrics")
@RequiredArgsConstructor
@Tag(name = "Metrics", description = "Endpoints for fetching scheduler throughput, latency, and dashboard statistics")
public class MetricsController {

    private final MetricService metricService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get high-level summary metrics for the system dashboard")
    public ResponseEntity<DashboardMetrics> getDashboard() {
        return ResponseEntity.ok(metricService.getDashboardMetrics());
    }

    @GetMapping("/throughput")
    @Operation(summary = "Get completed job throughput data for the last 24 hours")
    public ResponseEntity<List<MetricPoint>> getThroughput() {
        return ResponseEntity.ok(metricService.getThroughputSeries());
    }

    @GetMapping("/latency")
    @Operation(summary = "Get average latency data for the last 24 hours")
    public ResponseEntity<List<MetricPoint>> getLatency() {
        return ResponseEntity.ok(metricService.getLatencySeries());
    }

    @GetMapping("/queue-depth")
    @Operation(summary = "Get job queue depth/waiting statistics for the last 24 hours")
    public ResponseEntity<List<MetricPoint>> getQueueDepth() {
        return ResponseEntity.ok(metricService.getQueueDepthSeries());
    }

    @GetMapping("/jobs-by-status")
    @Operation(summary = "Get distribution of jobs by status")
    public ResponseEntity<List<Map<String, Object>>> getJobsByStatus() {
        return ResponseEntity.ok(metricService.getJobsByStatus());
    }

    @GetMapping("/jobs-by-queue")
    @Operation(summary = "Get distribution of jobs by queue")
    public ResponseEntity<List<Map<String, Object>>> getJobsByQueue() {
        return ResponseEntity.ok(metricService.getJobsByQueue());
    }

    @GetMapping("/worker-health")
    @Operation(summary = "Get list of active workers and their health/success rates")
    public ResponseEntity<List<Map<String, Object>>> getWorkerHealth() {
        return ResponseEntity.ok(metricService.getWorkerHealth());
    }

    @GetMapping("/hourly-jobs")
    @Operation(summary = "Get hourly completed/failed job count metrics for the last 12 hours")
    public ResponseEntity<List<Map<String, Object>>> getHourlyJobs() {
        return ResponseEntity.ok(metricService.getHourlyJobsSeries());
    }
}
