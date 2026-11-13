
package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "screening_questions")
public class ScreeningQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String questionText;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false, length = 30)
    private String answerType;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean reviewOnYes = false;

    @Column(nullable = false)
    private boolean reviewOnNo = false;

    public ScreeningQuestion() {
    }

    public Long getId() {
        return id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getAnswerType() {
        return answerType;
    }

    public void setAnswerType(String answerType) {
        this.answerType = answerType;
    }

    public boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean getReviewOnYes() {
        return reviewOnYes;
    }

    public void setReviewOnYes(boolean reviewOnYes) {
        this.reviewOnYes = reviewOnYes;
    }

    public boolean getReviewOnNo() {
        return reviewOnNo;
    }

    public void setReviewOnNo(boolean reviewOnNo) {
        this.reviewOnNo = reviewOnNo;
    }
}
