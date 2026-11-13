package com.example.demo.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.BloodRequest;
import com.example.demo.entity.Donor;
import com.example.demo.entity.DonorResponse;
import com.example.demo.repository.BloodRequestRepository;
import com.example.demo.repository.DonorResponseRepository;
import com.example.demo.service.DonorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/donors")
public class DonorController {

    private final DonorService donorService;
    private final BloodRequestRepository requestRepository;
    private final DonorResponseRepository responseRepository;

    public DonorController(DonorService donorService,
    		                 BloodRequestRepository requestRepository,
    		                 DonorResponseRepository responseRepository) {
        this.donorService = donorService;
        this.requestRepository=requestRepository;
        this.responseRepository=responseRepository;
    }

    // POST: Register donor
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Donor registerDonor(
            @Valid @RequestBody Donor donor) {

        return donorService.registerDonor(donor);
    }

    // GET: Get all active donors
    @GetMapping
    public List<Donor> getAllDonors() {
        return donorService.getAllDonors();
    }

    // GET: Get donor by ID
    @GetMapping("/{id}")
    public Donor getDonorById(@PathVariable Long id) {
        return donorService.getDonorById(id);
    }


@GetMapping("/search")
public ResponseEntity<List<Donor>> searchDonors(
        @RequestParam(required = false) String bloodGroup,
        @RequestParam(required = false) String city) {

    return ResponseEntity.ok(
        donorService.searchDonors(bloodGroup, city)
    );
}


    // PUT: Update donor
    @PutMapping("/{id}")
    public Donor updateDonor(
            @PathVariable Long id,
            @Valid @RequestBody Donor donor) {

        return donorService.updateDonor(id, donor);
    }

    // PATCH: Deactivate donor
    @PatchMapping("/{id}/deactivate")
    public Donor deactivateDonor(@PathVariable Long id) {
        return donorService.deactivateDonor(id);
    }

    // PATCH: Reactivate donor
    @PatchMapping("/{id}/activate")
    public Donor activateDonor(@PathVariable Long id) {
        return donorService.activateDonor(id);
    }


@PatchMapping("/{id}/availability")
public ResponseEntity<Donor> updateAvailability(
        @PathVariable Long id,
        @RequestParam boolean available) {

    return ResponseEntity.ok(
        donorService.updateAvailability(id, available)
    );
}

@GetMapping("/{id}/incoming-requests")
public List<Map<String, Object>> getIncomingRequests(
        @PathVariable("id") Long id) {

    // Verify donor exists
    donorService.getDonorById(id);

    // Find assignments for this donor
    List<DonorResponse> assignments =
            responseRepository.findByDonorId(id);

    List<Map<String, Object>> result = new ArrayList<>();

    for (DonorResponse assignment : assignments) {

        String status = assignment.getResponseStatus();

        // Show only pending and accepted requests
        if (!"PENDING".equalsIgnoreCase(status)
                && !"ACCEPTED".equalsIgnoreCase(status)) {
            continue;
        }

        BloodRequest request = requestRepository
                .findById(assignment.getBloodRequestId())
                .orElse(null);

        if (request == null) {
            continue;
        }

        Map<String, Object> item = new LinkedHashMap<>();

        item.put("responseId", assignment.getId());
        item.put("bloodRequestId", request.getId());
        item.put("donorId", id);
        item.put("responseStatus", status);
        item.put("requesterName", request.getRequesterName());
        item.put("bloodGroup", request.getBloodGroup());
        item.put("city", request.getCity());
        item.put("unitsRequired", request.getUnitsRequired());
        item.put("hospitalName", request.getHospitalName());
        item.put("createdAt", request.getCreatedAt());

        // Reveal phone only after acceptance
        if ("ACCEPTED".equalsIgnoreCase(status)) {
            item.put("requesterPhone", request.getRequesterPhone());
        }

        result.add(item);
    }

    return result;
}
}