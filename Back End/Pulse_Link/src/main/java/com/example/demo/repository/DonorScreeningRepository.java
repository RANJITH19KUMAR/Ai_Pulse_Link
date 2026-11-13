package com.example.demo.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.DonorScreening;

public interface DonorScreeningRepository
        extends JpaRepository<DonorScreening, Long> {

    Optional<DonorScreening> findByDonorIdAndBloodRequestId(
            Long donorId, Long bloodRequestId);
}