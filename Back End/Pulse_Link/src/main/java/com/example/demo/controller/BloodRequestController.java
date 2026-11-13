
package com.example.demo.controller;

import java.util.Comparator;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.BloodRequest;
import com.example.demo.entity.Donor;
import com.example.demo.entity.DonorResponse;
import com.example.demo.repository.BloodRequestRepository;
import com.example.demo.repository.DonorRepository;
import com.example.demo.repository.DonorResponseRepository;

@RestController
@RequestMapping("/blood-requests")
public class BloodRequestController {

    private final BloodRequestRepository repository;
    private final DonorRepository donorRepository;
    private final DonorResponseRepository responseRepository;

    public BloodRequestController(
            BloodRequestRepository repository, DonorRepository donorRepository, DonorResponseRepository responseRepository) {
        this.repository = repository;
        this.donorRepository=donorRepository;
		this.responseRepository = responseRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BloodRequest createRequest(
            @RequestBody BloodRequest request) {

        request.setStatus("PENDING");
        return repository.save(request);
    }

    @GetMapping
    public List<BloodRequest> getAllRequests() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public BloodRequest getRequestById(
            @PathVariable Long id) {

        return repository.findById(id)
            .orElseThrow(() ->
                new RuntimeException("Blood request not found"));
    }


//    @GetMapping("/{id}/matching-donors")
//    public List<Donor> findMatchingDonors(
//            @PathVariable Long id) {
//
//        BloodRequest request = repository.findById(id)
//            .orElseThrow(() -> new ResponseStatusException(
//                HttpStatus.NOT_FOUND, "Blood request not found"));
//
//        return donorRepository
//            .findByBloodGroupIgnoreCaseAndCityIgnoreCaseAndActiveTrueAndAvailableTrue(
//                request.getBloodGroup(),
//                request.getCity()
//            );
//    }

@PostMapping("/{requestId}/send-to-donor/{donorId}")
@ResponseStatus(HttpStatus.CREATED)
public DonorResponse sendRequestToDonor(@PathVariable Long requestId, @PathVariable Long donorId){

	//1.BloodRequest
	BloodRequest request=repository.findById(requestId)
			.orElseThrow(() -> new ResponseStatusException(
					HttpStatus.NOT_FOUND,"Blood Request not found"
					));

	//2.find donor

	Donor donor= donorRepository.findById(donorId)
			.orElseThrow(() -> new ResponseStatusException(
					HttpStatus.NOT_FOUND,"Donor not Found"
					));

	//3.active, available, match blood group ,
	if(!donor.isActive() || !donor.isAvailable()) {
		throw new ResponseStatusException(
				HttpStatus.BAD_REQUEST,
				"the donor is not currently available"
				);
	}


	if(request.getBloodGroup() == null || donor.getBloodGroup()==null ||
			!request.getBloodGroup().trim().equalsIgnoreCase(donor.getBloodGroup().trim())){

		throw new ResponseStatusException (
				HttpStatus.BAD_REQUEST,
				"donor blood group does not match the request"
				);
	}
	//4. twice request the same donor

	if(responseRepository.existsByBloodRequestIdAndDonorId(requestId, donorId)) {

		throw new ResponseStatusException (
				HttpStatus.CONFLICT,
				"this request has already been sent to donor"
				);
	}

	DonorResponse assignment = new DonorResponse();
	assignment.setBloodRequestId(requestId);
	assignment.setDonorId(donorId);
	assignment.setResponseStatus("PENDING");
	assignment.setRespondedAt(null);

	return responseRepository.save(assignment);

}

@PostMapping("/{requestId}/responses")
public DonorResponse respondToRequest(
        @PathVariable Long requestId,
        @RequestParam Long donorId,
        @RequestBody DonorResponse response) {

    // Check that the blood request exists
    repository.findById(requestId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Blood request not found"));

    // Check that the donor exists
    donorRepository.findById(donorId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Donor not found"));

    // Validate the response
    String status = response.getResponseStatus();

    if (status == null ||
        !(status.equalsIgnoreCase("ACCEPTED") ||
          status.equalsIgnoreCase("DECLINED"))) {

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Response must be ACCEPTED or DECLINED");
    }

    // the donor can respond only if the request assign
   DonorResponse assignment = responseRepository
		   .findByBloodRequestIdAndDonorId(requestId, donorId)
		   .orElseThrow(() -> new ResponseStatusException(
				   HttpStatus.NOT_FOUND,
				   "No requeste has been assigned to this donor")
				   );

   // decision can be made only while the request pending

   if(!"PENDING".equalsIgnoreCase(assignment.getResponseStatus())) {

	   throw new ResponseStatusException (
			   HttpStatus.CONFLICT,
			   "The donor already been answered"
			   );
   }

   assignment.setResponseStatus(status.toUpperCase());
   assignment.setRespondedAt(java.time.LocalDateTime.now());

    return responseRepository.save(assignment);
}


@GetMapping("/{requestId}/responses")
public List<Map<String, Object>> getRequestResponses(
        @PathVariable Long requestId) {

    repository.findById(requestId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Blood request not found"
        ));

    List<DonorResponse> responses =
        responseRepository.findByBloodRequestId(requestId);

    List<Map<String, Object>> result = new ArrayList<>();

    for (DonorResponse assignment : responses) {
        Map<String, Object> item = new LinkedHashMap<>();

        item.put("responseId", assignment.getId());
        item.put("requestId", requestId);
        item.put("donorId", assignment.getDonorId());
        item.put("responseStatus", assignment.getResponseStatus());

        if ("ACCEPTED".equalsIgnoreCase(
                assignment.getResponseStatus())) {

            Donor donor = donorRepository
                .findById(assignment.getDonorId())
                .orElse(null);

            if (donor != null) {
                item.put("donorName", donor.getName());
                item.put("donorPhone", donor.getPhone());
            }
        }

        result.add(item);
    }

    return result;
}



@GetMapping("/{id}/matching-donors")
public List<Donor> findMatchingDonors( @PathVariable Long id) {

    BloodRequest request = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Blood request not found"));

    List<Donor> donors = donorRepository
        .findByBloodGroupIgnoreCaseAndActiveTrueAndAvailableTrue(
            request.getBloodGroup());

    String requestedCity = request.getCity();

    donors.sort(
    	    Comparator
    	        .comparing(
    	            (Donor donor) ->
    	                !sameCity(donor.getCity(), requestedCity)
    	        )
    	        .thenComparing(
    	            Donor::getName,
    	            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
    	        )
    	);

    return donors;
}

@PostMapping("/{requestId}/send-to-matching-donors")
public Map<String, Object> sendToMatchingDonors(
        @PathVariable Long requestId) {

    // 1. Find the blood request.
    BloodRequest request = repository.findById(requestId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Blood request not found"
        ));

    if (request.getBloodGroup() == null ||
        request.getBloodGroup().trim().isEmpty()) {

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Blood group is required"
        );
    }

    // 2. Find active and available donors with the required blood group.
    List<Donor> donors =
        donorRepository.findByBloodGroupIgnoreCaseAndActiveTrueAndAvailableTrue(
            request.getBloodGroup().trim()
        );

    // 3. Prioritize donors in the requester's city.
    String requestedCity = request.getCity();
    donors.sort(
    	    Comparator
    	        .comparing(
    	            (Donor donor) ->
    	                !sameCity(donor.getCity(), requestedCity)
    	        )
    	        .thenComparing(
    	            Donor::getName,
    	            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
    	        )
    	);

    // 4. Prepare invitations, skipping existing assignments.
    List<DonorResponse> newAssignments = new ArrayList<>();
    int skippedCount = 0;

    for (Donor donor : donors) {

        boolean alreadySent =
            responseRepository.existsByBloodRequestIdAndDonorId(
                requestId,
                donor.getId()
            );

        if (alreadySent) {
            skippedCount++;
            continue;
        }

        DonorResponse assignment = new DonorResponse();

        assignment.setBloodRequestId(requestId);
        assignment.setDonorId(donor.getId());
        assignment.setResponseStatus("PENDING");
        assignment.setRespondedAt(null);

        newAssignments.add(assignment);
    }

    // 5. Save the new invitations.
    List<DonorResponse> savedAssignments =
        responseRepository.saveAll(newAssignments);

    // 6. Return a useful response to React.
    Map<String, Object> result = new LinkedHashMap<>();

    result.put("requestId", requestId);
    result.put("sentCount", savedAssignments.size());
    result.put("skippedCount", skippedCount);
    result.put("message",
        savedAssignments.isEmpty()
            ? "No new invitations were sent. All matching donors may already have invitations."
            : "Invitations created successfully."
    );

    return result;
}
private boolean sameCity(String donorCity, String requesterCity) {
    if (donorCity == null || requesterCity == null) {
        return false;
    }

    return donorCity.trim().equalsIgnoreCase(requesterCity.trim());
}
}