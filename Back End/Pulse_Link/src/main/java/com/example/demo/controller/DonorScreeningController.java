package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.StartScreeningRequest;
import com.example.demo.dto.SaveScreeningAnswerRequest;
import com.example.demo.entity.Donor;
import com.example.demo.entity.BloodRequest;
import com.example.demo.entity.DonorScreening;
import com.example.demo.entity.ScreeningAnswer;
import com.example.demo.entity.ScreeningQuestion;
import com.example.demo.repository.DonorRepository;
import com.example.demo.repository.BloodRequestRepository;
import com.example.demo.repository.DonorScreeningRepository;
import com.example.demo.repository.ScreeningAnswerRepository;
import com.example.demo.repository.ScreeningQuestionRepository;

@RestController
@RequestMapping("/screenings")
@CrossOrigin(origins = {
    "http://localhost:5173"
})
public class DonorScreeningController {

    private final DonorRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final DonorScreeningRepository screeningRepository;
    private final ScreeningAnswerRepository answerRepository;
    private final ScreeningQuestionRepository questionRepository;

    public DonorScreeningController(
            DonorRepository donorRepository,
            BloodRequestRepository bloodRequestRepository,
            DonorScreeningRepository screeningRepository,
            ScreeningAnswerRepository answerRepository,
            ScreeningQuestionRepository questionRepository) {

        this.donorRepository = donorRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.screeningRepository = screeningRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }

    // 1. Start or resume a screening
    @PostMapping("/start")
    public ResponseEntity<?> startScreening(
            @RequestBody StartScreeningRequest request) {

        if (request.getDonorId() == null
                || request.getBloodRequestId() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Donor ID and blood request ID are required."));
        }

        Optional<Donor> donor =
                donorRepository.findById(request.getDonorId());

        if (donor.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Donor not found."));
        }

        Optional<BloodRequest> bloodRequest =
                bloodRequestRepository.findById(
                        request.getBloodRequestId());

        if (bloodRequest.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Blood request not found."));
        }

        Optional<DonorScreening> existing =
                screeningRepository.findByDonorIdAndBloodRequestId(
                        request.getDonorId(),
                        request.getBloodRequestId());

        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        DonorScreening screening = new DonorScreening();
        screening.setDonorId(request.getDonorId());
        screening.setBloodRequestId(request.getBloodRequestId());
        screening.setStatus("IN_PROGRESS");

        DonorScreening saved =
                screeningRepository.save(screening);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 2. Save or update an answer
    @PostMapping("/{screeningId}/answers")
    @Transactional
    public ResponseEntity<?> saveAnswer(
            @PathVariable Long screeningId,
            @RequestBody SaveScreeningAnswerRequest request) {

        if (request.getQuestionId() == null
                || request.getAnswer() == null
                || request.getAnswer().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Question ID and answer are required."));
        }

        Optional<DonorScreening> screeningOptional =
                screeningRepository.findById(screeningId);

        if (screeningOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Screening not found."));
        }

        DonorScreening screening = screeningOptional.get();

        if (!"IN_PROGRESS".equals(screening.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Answers can only be saved while screening is in progress."));
        }

        Optional<ScreeningQuestion> questionOptional =
                questionRepository.findById(request.getQuestionId());

        if (questionOptional.isEmpty()
                || !questionOptional.get().getActive()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Active screening question not found."));
        }

        String answer = request.getAnswer().trim();
        String answerType = questionOptional.get().getAnswerType();

        boolean validAnswer;

        if ("YES_NO".equals(answerType)) {
            answer = answer.toUpperCase();
            validAnswer = List.of("YES", "NO").contains(answer);

        } else if ("YES_NO_UNSURE".equals(answerType)) {
            answer = answer.toUpperCase();
            validAnswer = List.of("YES", "NO", "UNSURE")
                    .contains(answer);

        } else if ("DATE".equals(answerType)) {
            try {
                java.time.LocalDate donationDate =
                        java.time.LocalDate.parse(answer);

                validAnswer = !donationDate.isAfter(
                        java.time.LocalDate.now());

            } catch (java.time.format.DateTimeParseException exception) {
                validAnswer = false;
            }

        } else {
            validAnswer = false;
        }

        if (!validAnswer) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Invalid answer. For a date question, use YYYY-MM-DD."
                    ));
        }

        Optional<ScreeningAnswer> existingAnswer =
                answerRepository.findByScreeningIdAndQuestionId(
                        screeningId, request.getQuestionId());

        ScreeningAnswer screeningAnswer =
                existingAnswer.orElseGet(ScreeningAnswer::new);

        screeningAnswer.setScreeningId(screeningId);
        screeningAnswer.setQuestionId(request.getQuestionId());
        screeningAnswer.setAnswer(answer);
        screeningAnswer.setAnsweredAt(LocalDateTime.now());

        ScreeningAnswer saved =
                answerRepository.save(screeningAnswer);

        return ResponseEntity.ok(saved);
    }

    // 3. View screening and saved answers
    @GetMapping("/{screeningId}")
    public ResponseEntity<?> getScreening(
            @PathVariable Long screeningId) {

        Optional<DonorScreening> screeningOptional =
                screeningRepository.findById(screeningId);

        if (screeningOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Screening not found."));
        }

        DonorScreening screening = screeningOptional.get();

        List<ScreeningAnswer> answers =
                answerRepository.findByScreeningId(screeningId);

        return ResponseEntity.ok(Map.of(
                "screening", screening,
                "answers", answers
        ));
    }
 // 4. Complete screening

    // 4. Complete screening
    @PostMapping("/{screeningId}/complete")
    @Transactional
    public ResponseEntity<?> completeScreening(
            @PathVariable Long screeningId) {

        Optional<DonorScreening> screeningOptional =
                screeningRepository.findById(screeningId);

        if (screeningOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Screening not found."));
        }

        DonorScreening screening = screeningOptional.get();

        if (!"IN_PROGRESS".equals(screening.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Screening is not in progress."));
        }

        List<ScreeningQuestion> questions =
                questionRepository.findByActiveTrueOrderByDisplayOrderAsc();

        List<ScreeningAnswer> answers =
                answerRepository.findByScreeningId(screeningId);

        Map<Long, ScreeningAnswer> answerMap =
                new java.util.HashMap<>();

        for (ScreeningAnswer answer : answers) {
            answerMap.put(answer.getQuestionId(), answer);
        }

        // Find the previous-donation and donation-date questions.
        ScreeningQuestion previousDonationQuestion = null;
        ScreeningQuestion donationDateQuestion = null;

        for (ScreeningQuestion question : questions) {
            if (question.getDisplayOrder() == 2) {
                previousDonationQuestion = question;
            }

            if (question.getDisplayOrder() == 6) {
                donationDateQuestion = question;
            }
        }

        if (previousDonationQuestion == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message",
                            "Previous-donation question is not configured."));
        }

        ScreeningAnswer previousDonationAnswer =
                answerMap.get(previousDonationQuestion.getId());

        if (previousDonationAnswer == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Please answer whether you have donated blood before."));
        }

        String previousDonation =
                previousDonationAnswer.getAnswer();

        if (!"YES".equals(previousDonation)
                && !"NO".equals(previousDonation)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Invalid previous-donation answer."));
        }

        // Require the date only if the donor answered YES.
        if ("YES".equals(previousDonation)) {

            if (donationDateQuestion == null
                    || !donationDateQuestion.getActive()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message",
                                "Donation-date question is not configured."));
            }

            ScreeningAnswer dateAnswer =
                    answerMap.get(donationDateQuestion.getId());

            if (dateAnswer == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Please provide your last donation date."));
            }

            try {
                java.time.LocalDate donationDate =
                        java.time.LocalDate.parse(dateAnswer.getAnswer());

                if (donationDate.isAfter(java.time.LocalDate.now())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message",
                                    "Donation date cannot be in the future."));
                }
            } catch (java.time.format.DateTimeParseException exception) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Invalid donation date. Use YYYY-MM-DD."));
            }
        }

        boolean needsReview = false;

        for (ScreeningQuestion question : questions) {

            // Question 6 is conditional and is handled separately.
            if (question.getDisplayOrder() == 6) {
                continue;
            }

            ScreeningAnswer answer =
                    answerMap.get(question.getId());

            if (answer == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Please answer all required screening questions."));
            }

            String value = answer.getAnswer();

            if ("UNSURE".equals(value)
                    || ("YES".equals(value)
                        && question.getReviewOnYes())
                    || ("NO".equals(value)
                        && question.getReviewOnNo())) {

                needsReview = true;
            }
        }

        // A reported previous donation requires the date to be
        // considered under the applicable blood-bank rules.
        // This is a review flag, not an eligibility decision.
        if ("YES".equals(previousDonation)) {
            needsReview = true;
        }

        screening.setStatus(
                needsReview
                        ? "NEEDS_MEDICAL_REVIEW"
                        : "AWAITING_MEDICAL_APPROVAL"
        );

        screening.setCompletedAt(LocalDateTime.now());

        DonorScreening saved =
                screeningRepository.save(screening);

        return ResponseEntity.ok(Map.of(
                "message", "Digital screening completed.",
                "screening", saved
        ));
    }
}