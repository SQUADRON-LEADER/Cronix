package com.cronix.backend.application.service;

import com.cronix.backend.infrastructure.persistence.entity.JobEntity;
import com.cronix.backend.infrastructure.persistence.entity.ScheduledJobEntity;
import com.cronix.backend.infrastructure.persistence.repository.JobRepository;
import com.cronix.backend.infrastructure.persistence.repository.ScheduledJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CronSchedulerService {

    private final ScheduledJobRepository scheduledJobRepository;
    private final JobRepository jobRepository;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processScheduledJobs() {
        Instant now = Instant.now();
        List<ScheduledJobEntity> pending = scheduledJobRepository.findPendingScheduledJobs(now);

        if (pending.isEmpty()) {
            return;
        }

        log.debug("Processing {} pending scheduled cron jobs", pending.size());

        for (ScheduledJobEntity scheduled : pending) {
            try {
                // Submit execution job
                JobEntity job = JobEntity.builder()
                        .name(scheduled.getName())
                        .queueId(scheduled.getQueueId())
                        .status("queued")
                        .priority(scheduled.getPriority())
                        .maxAttempts(scheduled.getMaxAttempts())
                        .attempts(0)
                        .payload(scheduled.getPayload())
                        .scheduledAt(now)
                        .build();

                jobRepository.save(job);
                log.info("Created job execution {} from scheduled cron job {}", job.getId(), scheduled.getName());

                // Calculate next execution run time
                ZonedDateTime currentZdt = ZonedDateTime.ofInstant(now, ZoneId.systemDefault());
                CronExpression cron = CronExpression.parse(scheduled.getCronExpression());
                ZonedDateTime nextZdt = cron.next(currentZdt);

                if (nextZdt != null) {
                    scheduled.setLastRunAt(now);
                    scheduled.setNextRunAt(nextZdt.toInstant());
                    scheduledJobRepository.save(scheduled);
                    log.info("Scheduled next run for cron job {} at {}", scheduled.getName(), nextZdt.toInstant());
                } else {
                    log.warn("Could not determine next run time for cron job {}", scheduled.getName());
                }

            } catch (Exception e) {
                log.error("Failed to schedule job for scheduled cron entry {}: {}", scheduled.getId(), e.getMessage());
            }
        }
    }
}
