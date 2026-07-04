package com.cronix.backend.infrastructure.bootstrap;

import com.cronix.backend.infrastructure.persistence.entity.*;
import com.cronix.backend.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final QueueRepository queueRepository;
    private final WorkerRepository workerRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping seeder bootstrap.");
            return;
        }

        log.info("Seeding default Cronix database...");

        // 1. Create Default User
        UserEntity demoUser = UserEntity.builder()
                .email("demo@cronix.dev")
                .name("Alex Chen")
                .passwordHash(passwordEncoder.encode("demo1234"))
                .role("admin")
                .build();
        userRepository.save(demoUser);

        // 2. Create Organization
        OrganizationEntity org = OrganizationEntity.builder()
                .name("Cronix Global Org")
                .description("Default organization for jobs orchestration")
                .build();
        org = organizationRepository.save(org);

        // 3. Create Projects
        ProjectEntity proj1 = ProjectEntity.builder()
                .name("E-Commerce Platform")
                .description("Main e-commerce backend services")
                .status("active")
                .organizationId(org.getId())
                .build();
        proj1 = projectRepository.save(proj1);

        ProjectEntity proj2 = ProjectEntity.builder()
                .name("Payment Processing")
                .description("Payment gateway and transaction handling")
                .status("active")
                .organizationId(org.getId())
                .build();
        proj2 = projectRepository.save(proj2);

        ProjectEntity proj3 = ProjectEntity.builder()
                .name("Data Analytics")
                .description("Data pipeline and analytics jobs")
                .status("active")
                .organizationId(org.getId())
                .build();
        proj3 = projectRepository.save(proj3);

        // 4. Create Queues
        QueueEntity q1 = QueueEntity.builder()
                .name("primary-queue")
                .projectId(proj1.getId())
                .status("active")
                .priority(10)
                .maxConcurrency(10)
                .retryPolicyType("LINEAR")
                .retryBaseDelaySec(10)
                .retryMaxDelaySec(60)
                .retryMaxAttempts(3)
                .build();
        q1 = queueRepository.save(q1);

        QueueEntity q2 = QueueEntity.builder()
                .name("payment-critical")
                .projectId(proj2.getId())
                .status("active")
                .priority(20)
                .maxConcurrency(5)
                .retryPolicyType("EXPONENTIAL")
                .retryBaseDelaySec(5)
                .retryMaxDelaySec(300)
                .retryMaxAttempts(5)
                .build();
        q2 = queueRepository.save(q2);

        QueueEntity q3 = QueueEntity.builder()
                .name("data-pipeline")
                .projectId(proj3.getId())
                .status("active")
                .priority(5)
                .maxConcurrency(15)
                .retryPolicyType("FIXED")
                .retryBaseDelaySec(30)
                .retryMaxDelaySec(120)
                .retryMaxAttempts(2)
                .build();
        q3 = queueRepository.save(q3);

        // 5. Create Workers
        WorkerEntity w1 = WorkerEntity.builder()
                .name("node-1")
                .status("online")
                .queues(Arrays.asList(q1.getId(), q2.getId()))
                .cpuUsage(45)
                .memoryUsage(62)
                .uptimeSeconds(3456)
                .version("1.2.3")
                .lastHeartbeat(Instant.now())
                .metadata(Map.of("region", "us-east-1", "instance", "m5.large"))
                .build();
        w1 = workerRepository.save(w1);

        WorkerEntity w2 = WorkerEntity.builder()
                .name("node-2")
                .status("busy")
                .queues(Arrays.asList(q1.getId(), q3.getId()))
                .cpuUsage(89)
                .memoryUsage(75)
                .uptimeSeconds(2134)
                .version("1.2.3")
                .lastHeartbeat(Instant.now())
                .metadata(Map.of("region", "us-east-1", "instance", "m5.large"))
                .build();
        w2 = workerRepository.save(w2);

        WorkerEntity w3 = WorkerEntity.builder()
                .name("node-3")
                .status("online")
                .queues(Arrays.asList(q1.getId()))
                .cpuUsage(32)
                .memoryUsage(48)
                .uptimeSeconds(1234)
                .version("1.2.2")
                .lastHeartbeat(Instant.now())
                .metadata(Map.of("region", "us-west-2", "instance", "m5.large"))
                .build();
        w3 = workerRepository.save(w3);

        // 6. Create Jobs
        JobEntity j1 = JobEntity.builder()
                .name("Process Order #12345")
                .queueId(q1.getId())
                .status("running")
                .priority(10)
                .attempts(1)
                .maxAttempts(3)
                .payload(Map.of("orderId", "12345", "userId", "user-123"))
                .workerId(w1.getId())
                .startedAt(Instant.now().minusSeconds(300))
                .build();
        jobRepository.save(j1);

        JobEntity j2 = JobEntity.builder()
                .name("Send Welcome Email")
                .queueId(q1.getId())
                .status("completed")
                .priority(5)
                .attempts(1)
                .maxAttempts(3)
                .payload(Map.of("email", "newuser@example.com", "template", "welcome"))
                .result(Map.of("messageId", "msg-abc123", "sent", true))
                .workerId(w2.getId())
                .startedAt(Instant.now().minusSeconds(1500))
                .completedAt(Instant.now().minusSeconds(1440))
                .duration(60000L)
                .build();
        jobRepository.save(j2);

        JobEntity j3 = JobEntity.builder()
                .name("Payment Gateway Call")
                .queueId(q2.getId())
                .status("pending")
                .priority(20)
                .attempts(0)
                .maxAttempts(5)
                .payload(Map.of("amount", 99.99, "currency", "USD", "customerId", "cust-456"))
                .build();
        jobRepository.save(j3);

        log.info("Cronix seeding complete! Seeded 1 default user (demo@cronix.dev), 3 projects, 3 queues, 3 workers, and 3 initial jobs.");
    }
}
