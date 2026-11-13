
package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.DonorResponse;

public interface DonorResponseRepository
        extends JpaRepository<DonorResponse, Long> {

	List<DonorResponse> findByDonorId(Long donorId);
    List<DonorResponse> findByBloodRequestId(Long bloodRequestId);

    Optional<DonorResponse> findByBloodRequestIdAndDonorId(Long bloodRequestId, Long donorId);
    boolean existsByBloodRequestIdAndDonorId(
        Long bloodRequestId, Long donorId
    );
}
