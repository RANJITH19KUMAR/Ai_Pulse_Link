
package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.UserService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        String message = userService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@Valid @RequestBody LoginRequest request){

    	Map<String, String> message = userService.login(request.getEmail(), request.getPassword());
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(message);
    }
}
