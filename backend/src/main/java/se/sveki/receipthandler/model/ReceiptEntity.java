package se.sveki.receipthandler.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class ReceiptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyId;
    private String contentType;
    private String originalFilename;
    private Instant receivedAt;
    private Instant bookedAt;

    @Column(columnDefinition = "bytea")
    private byte[] imageData;

    public ReceiptEntity() {}

    public ReceiptEntity(String companyId, String contentType, String originalFilename, byte[] imageData) {
        this.companyId = companyId;
        this.contentType = contentType;
        this.originalFilename = originalFilename;
        this.imageData = imageData;
        this.receivedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getCompanyId() { return companyId; }
    public String getContentType() { return contentType; }
    public String getOriginalFilename() { return originalFilename; }
    public Instant getReceivedAt() { return receivedAt; }
    public Instant getBookedAt() { return bookedAt; }
    public byte[] getImageData() { return imageData; }
    public void setBookedAt(Instant bookedAt) { this.bookedAt = bookedAt; }
}