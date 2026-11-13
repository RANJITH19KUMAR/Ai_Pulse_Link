
package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.ScreeningQuestion;
import com.example.demo.repository.ScreeningQuestionRepository;

@RestController
@RequestMapping("/screening/questions")
@CrossOrigin(origins = {"http://localhost:5173"})
public class ScreeningQuestionController {

    private final ScreeningQuestionRepository repository;

    public ScreeningQuestionController(
            ScreeningQuestionRepository repository) {
        this.repository = repository;
    }

    // Returns the basic questions, excluding the conditional date question
    @GetMapping
    public List<ScreeningQuestion> getQuestions() {
        return repository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .filter(question -> question.getDisplayOrder() != 6)
                .toList();
    }

    // Returns the last-donation-date question when requested
    @GetMapping("/last-donation-date")
    public List<ScreeningQuestion> getLastDonationDateQuestion() {
        return repository.findByDisplayOrder(6)
                .filter(ScreeningQuestion::getActive)
                .map(List::of)
                .orElseGet(List::of);
    }
}
