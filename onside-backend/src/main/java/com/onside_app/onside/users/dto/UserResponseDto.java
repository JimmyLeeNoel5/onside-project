package com.onside_app.onside.users.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

/**
 * UserResponseDto
 *
 * This is what GET /users/me and PUT /users/me return to the frontend.
 *
 * Why a flat DTO?
 * The user's data lives across two tables: `users` (auth/identity) and
 * `user_profiles` (personal + soccer data). Rather than making the frontend
 * call two endpoints, we merge both into a single flat object here.
 *
 * Why strings for enums (primaryPosition, skillLevel, etc.)?
 * Java enums can't be serialized to JSON by default in a way the frontend
 * can easily work with. By calling .name() on each enum in the mapper,
 * we send plain strings like "MIDFIELDER" or "RECREATIONAL" that the
 * frontend can display directly or map to labels with a lookup object.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {

    // ── From the `users` table ─────────────────────────────────────────────────

    private UUID id;
    private String email;
    private String authProvider;        // "LOCAL", "GOOGLE", etc.
    private boolean emailVerified;

    // ── From the `user_profiles` table ────────────────────────────────────────

    // Personal info
    private String firstName;
    private String lastName;
    private String phone;
    private LocalDate dateOfBirth;
    private String avatarUrl;           // S3 object key
    private String bio;

    // Location
    private String city;
    private String state;               // 2-letter abbreviation e.g. "GA"
    private String zipCode;

    // Soccer info — returned as strings (enum names) not Java enum types
    private String primaryPosition;     // e.g. "MIDFIELDER"
    private String secondaryPosition;
    private String skillLevel;          // e.g. "RECREATIONAL"
    private String dominantFoot;        // e.g. "RIGHT"
    private String preferredGenderCat;  // e.g. "MALE"
    private Short jerseyNumber;

    // Social links
    private String instagramUrl;
    private String twitterUrl;
    private String tiktokUrl;
    private String youtubeUrl;
    private String personalWebsiteUrl;

    // Preferences
    private boolean receiveEmailAlerts;
    private boolean receiveSmsAlerts;
    private boolean profileIsPublic;
}
