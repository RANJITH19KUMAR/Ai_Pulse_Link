
package com.example.demo.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Donor;
import com.example.demo.entity.Users;
import com.example.demo.repository.DonorRepository;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            DonorRepository donorRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        String role = request.getRole().trim().toUpperCase();

        if (!role.equals("DONOR") && !role.equals("REQUESTER")) {
            throw new IllegalArgumentException(
                    "Role must be DONOR or REQUESTER");
        }

        if (role.equals("DONOR")) {
            if (request.getPhone() == null
                    || !request.getPhone().matches("^[0-9]{10}$")) {
                throw new IllegalArgumentException(
                        "Donor phone must contain 10 digits");
            }

            if (request.getBloodGroup() == null
                    || request.getBloodGroup().isBlank()) {
                throw new IllegalArgumentException(
                        "Blood group is required for donors");
            }

            if (request.getCity() == null
                    || request.getCity().isBlank()) {
                throw new IllegalArgumentException(
                        "City is required for donors");
            }

            if (donorRepository.existsByPhone(request.getPhone())) {
                throw new IllegalArgumentException(
                        "This phone number is already registered");
            }
        }

        Users user = new Users();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setActive(true);

        Users savedUser = userRepository.save(user);

        if (role.equals("DONOR")) {
            Donor donor = new Donor();
            donor.setName(request.getName().trim());
            donor.setEmail(email);
            donor.setPhone(request.getPhone());
            donor.setBloodGroup(request.getBloodGroup().trim());
            donor.setCity(request.getCity().trim());
            donor.setAvailable(true);
            donor.setActive(true);
            donor.setUser(savedUser);

            donorRepository.save(donor);
        }

        return "Registration successful";
    }


public Map<String, String> login(String email, String password) {

    String normalizedEmail = email.trim().toLowerCase();

    Users user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            ));

    if (!user.isActive()
            || !passwordEncoder.matches(password, user.getPassword())) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
        );
    }

    Map<String, String> result = new HashMap<>();

    result.put("message", "Login Successful");
    result.put("role", user.getRole());
    result.put("name", user.getName());

    if (user.getRole().equals("DONOR")) {
        Donor donor = donorRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Donor profile not found"
                ));

        result.put("donorId", donor.getId().toString());
    }

    return result;
}

}
