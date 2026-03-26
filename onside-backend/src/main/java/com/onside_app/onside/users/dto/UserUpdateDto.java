package com.onside_app.onside.users.dto;

import com.onside_app.onside.common.enums.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * UserUpdateDto — Java record
 *
 * Used as the request body for PUT /users/me.
 *
 * Why a record works for request DTOs:
 * Jackson can deserialize JSON into records as of Jackson 2.12+ (included in
 * Spring Boot 3+/4). It uses the canonical constructor to build the record,
 * passing null for any fields not present in the JSON body.
 *
 * Why all fields are nullable (no @NotNull):
 * This is a partial update — the frontend only sends the fields it wants
 * to change. Any field not included in the JSON arrives as null, and
 * UserService.updateMe() skips null fields (leaves DB value unchanged).
 *
 * Why Boolean (boxed) instead of boolean (primitive) for preferences:
 * Primitive boolean defaults to false if absent from JSON.
 * Boxed Boolean defaults to null, which lets us distinguish
 * "user didn't send this" from "user explicitly set it to false".
 *
 * Validation annotations on record components work exactly the same
 * as on class fields — @Valid in the controller triggers them.
 */
public record UserUpdateDto(

        // ── Personal info ──────────────────────────────────────────────────────
        @Size(max = 100, message = "First name must be 100 characters or fewer")
        String firstName,

        @Size(max = 100, message = "Last name must be 100 characters or fewer")
        String lastName,

        @Size(max = 20, message = "Phone must be 20 characters or fewer")
        String phone,

        LocalDate dateOfBirth,
        String bio,
        String avatarUrl,

        // ── Location ───────────────────────────────────────────────────────────
        @Size(max = 100)
        String city,

        @Size(max = 2, message = "State must be a 2-letter abbreviation e.g. GA")
        String state,

        @Size(max = 10)
        String zipCode,

        // ── Soccer info ────────────────────────────────────────────────────────
        // Jackson deserializes "MIDFIELDER" → PlayerPosition.MIDFIELDER automatically.
        // Invalid values return 400 Bad Request automatically.
        PlayerPosition primaryPosition,
        PlayerPosition secondaryPosition,
        SkillLevel skillLevel,
        DominantFoot dominantFoot,
        GenderCategory preferredGenderCat,

        @Min(value = 0, message = "Jersey number must be 0 or greater")
        @Max(value = 99, message = "Jersey number must be 99 or fewer")
        Short jerseyNumber,

        // ── Social links ───────────────────────────────────────────────────────
        String instagramUrl,
        String twitterUrl,
        String tiktokUrl,
        String youtubeUrl,
        String personalWebsiteUrl,

        // ── Preferences ────────────────────────────────────────────────────────
        Boolean receiveEmailAlerts,   // boxed — null = not sent by client
        Boolean receiveSmsAlerts,
        Boolean profileIsPublic

) {}