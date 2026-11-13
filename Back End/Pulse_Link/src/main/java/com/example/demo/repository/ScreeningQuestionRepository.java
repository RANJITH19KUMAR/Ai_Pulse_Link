package com.example.demo.repository;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.ScreeningQuestion;

public interface ScreeningQuestionRepository
        extends JpaRepository<ScreeningQuestion, Long> {

    List<ScreeningQuestion> findByActiveTrueOrderByDisplayOrderAsc();
    
    Optional<ScreeningQuestion> findByDisplayOrder(
            Integer displayOrder);
}