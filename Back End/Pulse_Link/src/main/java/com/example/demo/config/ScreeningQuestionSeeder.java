
package com.example.demo.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.entity.ScreeningQuestion;
import com.example.demo.repository.ScreeningQuestionRepository;

@Configuration
public class ScreeningQuestionSeeder {

    @Bean
    CommandLineRunner seedScreeningQuestions(
            ScreeningQuestionRepository repository) {

        return args -> {

            List<ScreeningQuestion> questions = List.of(
                createQuestion(
                    "BASIC",
                    "Are you feeling well today?",
                    1, "YES_NO", false, true
                ),
                createQuestion(
                    "BASIC",
                    "Have you donated blood before?",
                    2, "YES_NO", false, false
                ),
                createQuestion(
                    "MEDICAL_HISTORY",
                    "Have you ever been advised by a healthcare professional not to donate blood?",
                    3, "YES_NO", true, false
                ),
                createQuestion(
                    "PROCEDURES",
                    "Have you recently had a tattoo, piercing, surgery, or another medical procedure?",
                    4, "YES_NO", true, false
                ),
                createQuestion(
                    "MEDICAL_HISTORY",
                    "Have you consumed alcohol recently?",
                    5, "YES_NO", true, false
                ),
                createQuestion(
                	    "MEDICAL_HISTORY",
                	    "When was your last blood donation?",
                	    6,
                	    "DATE",
                	    true,
                	    false
                	)
            );

            for (ScreeningQuestion question : questions) {

                ScreeningQuestion existing =
                    repository.findByDisplayOrder(
                        question.getDisplayOrder()
                    ).orElse(null);

                if (existing != null) {
                    existing.setCategory(question.getCategory());
                    existing.setQuestionText(question.getQuestionText());
                    existing.setAnswerType(question.getAnswerType());
                    existing.setActive(true);
                    existing.setReviewOnYes(question.getReviewOnYes());
                    existing.setReviewOnNo(question.getReviewOnNo());

                    repository.save(existing);
                } else {
                    repository.save(question);
                }
            }
        };
    }

    private ScreeningQuestion createQuestion(
            String category,
            String questionText,
            int displayOrder,
            String answerType,
            boolean reviewOnYes,
            boolean reviewOnNo) {

        ScreeningQuestion question = new ScreeningQuestion();

        question.setCategory(category);
        question.setQuestionText(questionText);
        question.setDisplayOrder(displayOrder);
        question.setAnswerType(answerType);
        question.setActive(true);
        question.setReviewOnYes(reviewOnYes);
        question.setReviewOnNo(reviewOnNo);

        return question;
    }
}
