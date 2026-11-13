package com.example.demo.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(
    name = "donor_screenings",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"donor_id", "blood_request_id"}
    )
)
public class DonorScreening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donor_id", nullable = false)
    private Long donorId;

    @Column(name = "blood_request_id", nullable = false)
    private Long bloodRequestId;

    @Column(nullable = false, length = 40)
    private String status = "IN_PROGRESS";

    @Column(length = 1000)
    private String reviewReason;

    @Column(nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    public DonorScreening() {
    }

    public Long getId() {
        return id;
    }

    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public Long getBloodRequestId() {
        return bloodRequestId;
    }

    public void setBloodRequestId(Long bloodRequestId) {
        this.bloodRequestId = bloodRequestId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewReason() {
        return reviewReason;
    }

    public void setReviewReason(String reviewReason) {
        this.reviewReason = reviewReason;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}