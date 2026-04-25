package se.sveki.receipthandler.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
public class LogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private UUID userId;
    private Instant timestamp;

    public LogEntity() {}

    public LogEntity(UUID userId) {
        this.userId = userId;
        this.timestamp = Instant.now();
    }

    public Long getId() { return id; }
    public UUID getUserId() { return userId; }
    public Instant getTimestamp() { return timestamp; }
}