package com.cronix.backend.infrastructure.websocket;

import com.cronix.backend.domain.model.DashboardMetrics;
import com.cronix.backend.domain.model.Job;
import com.cronix.backend.domain.model.Notification;
import com.cronix.backend.domain.model.Worker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastJob(Job job) {
        try {
            messagingTemplate.convertAndSend("/topic/jobs", job);
            log.trace("Broadcasted job update: {}", job.getId());
        } catch (Exception e) {
            log.error("Failed to broadcast job update: {}", e.getMessage());
        }
    }

    public void broadcastWorker(Worker worker) {
        try {
            messagingTemplate.convertAndSend("/topic/workers", worker);
            log.trace("Broadcasted worker update: {}", worker.getId());
        } catch (Exception e) {
            log.error("Failed to broadcast worker update: {}", e.getMessage());
        }
    }

    public void broadcastMetrics(DashboardMetrics metrics) {
        try {
            messagingTemplate.convertAndSend("/topic/metrics", metrics);
            log.trace("Broadcasted dashboard metrics");
        } catch (Exception e) {
            log.error("Failed to broadcast metrics: {}", e.getMessage());
        }
    }

    public void broadcastNotification(Notification notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.info("Broadcasted notification alert: {}", notification.getTitle());
        } catch (Exception e) {
            log.error("Failed to broadcast notification: {}", e.getMessage());
        }
    }
}
