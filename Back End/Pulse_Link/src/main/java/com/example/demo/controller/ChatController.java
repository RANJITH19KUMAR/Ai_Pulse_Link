package com.example.demo.controller;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import com.example.demo.service.ChatService;

@RestController
@RequestMapping("/eligible-chat")
@CrossOrigin(origins="http://localhost:5173")

public class ChatController {

	private final ChatService   chatService;
	
	public ChatController(ChatService chatService) {
		this.chatService=chatService;
	}
	
	@PostMapping
	public Map<String, String> chat (@RequestBody Map<String, String> request){
		
		String message=request.get("message");
		
		if(message == null || message.isBlank()) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Message cannot empty"
					);
		}
		
		if(message.length() > 2000) {
			throw new ResponseStatusException (
					HttpStatus.BAD_REQUEST,
					"Message is too long"
					);
		}
		
		String reply = chatService.getReply(message);
		return Map.of("reply", reply);
	}
}
