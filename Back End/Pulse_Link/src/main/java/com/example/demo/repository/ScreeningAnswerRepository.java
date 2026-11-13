package com.example.demo.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.ScreeningAnswer;

public interface ScreeningAnswerRepository
        extends JpaRepository<ScreeningAnswer, Long> {

    List<ScreeningAnswer> findByScreeningId(Long screeningId);

    Optional<ScreeningAnswer> findByScreeningIdAndQuestionId(
            Long screeningId, Long questionId);
}