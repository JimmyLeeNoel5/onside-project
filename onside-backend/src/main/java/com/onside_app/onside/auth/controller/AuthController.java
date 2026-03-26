package com.onside_app.onside.auth.controller;

import com.onside_app.onside.auth.dto.*;
import com.onside_app.onside.auth.service.AuthService;
import com.onside_app.onside.auth.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Authentication", description = "Endpoints for user authentication and token management")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @Operation(summary = "Register a new user", description = "Creates a new user account and returns authentication tokens.")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @Operation(summary = "Login user", description = "Authenticates a user and returns access and refresh tokens.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Refresh access token", description = "Provides a new access token using a valid refresh token.")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Logout user", description = "Invalidates the provided refresh token.")
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @Valid @RequestBody RefreshTokenRequest request) {

        MessageResponse response = authService.logout(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Logout from all devices", description = "Revokes all refresh tokens for the currently authenticated user.")
    @PostMapping("/logout-all")
    public ResponseEntity<MessageResponse> logoutAll(
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID userId = jwtService.extractUserId(
                ((org.springframework.security.core.userdetails
                        .User) userDetails).getUsername()
        );

        MessageResponse response = authService.logoutAll(userId);
        return ResponseEntity.ok(response);
    }
}