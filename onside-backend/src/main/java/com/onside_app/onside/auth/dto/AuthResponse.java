package com.onside_app.onside.auth.dto;
import java.util.List;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserSummary user
) {
    // Nested record — avoids creating a separate file for a small object
    public record UserSummary(
            String id,
            String email,
            String firstName,
            String lastName,
            List<String> roles
    ) {}

    // Factory method — clean way to build the response
    public static AuthResponse of(
            String accessToken,
            String refreshToken,
            long expiresIn,
            UserSummary user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, user);
    }
}