package com.example.demo.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(
    name = "screening_answers",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"screening_id", "question_id"}
    )
)
public class ScreeningAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "screening_id", nullable = false)
    private Long screeningId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(nullable = false, length = 100)
    private String answer;

    @Column(nullable = false)
    private LocalDateTime answeredAt = LocalDateTime.now();

    public ScreeningAnswer() {
    }

    public Long getId() {
        return id;
    }

    public Long getScreeningId() {
        return screeningId;
    }

    public void setScreeningId(Long screeningId) {
        this.screeningId = screeningId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }
}