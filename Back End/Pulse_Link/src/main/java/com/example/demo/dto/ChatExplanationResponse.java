package com.example.demo.dto;

public class ChatExplanationResponse {

    private String reply;

    public ChatExplanationResponse() {
    }

    public ChatExplanationResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}