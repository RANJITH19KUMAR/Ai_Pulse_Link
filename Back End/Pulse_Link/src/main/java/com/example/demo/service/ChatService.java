package com.example.demo.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.*;
import org.springframework.web.bind.annotation.*;


@Service
public class ChatService {

	private final ChatClient chatClient;
	
	public ChatService(ChatClient.Builder builder) {
		this.chatClient=builder.defaultSystem(""" 
				You are the Pulse link donor screening assistant,
				
				Ask and explain blood donation screening questions
				politeley and simple language
				
				Do not diagnose medical conditions.
				Do not independently declare a donor medically fit.
				Do not invent eligibility rules or deferral periods.
				
				 Refer uncertain medical situations for professional review.
				 Only the backend java screening rules and authorized.medical professionals
				 can determine the screening outcome. 

				""").build();
		
		
	}
	public String getReply(String message) {
		return chatClient.prompt()
				.user(message)
				.call()
				.content();
	}
}
