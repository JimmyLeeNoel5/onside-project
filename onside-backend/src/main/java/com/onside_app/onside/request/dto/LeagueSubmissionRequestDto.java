package com.onside_app.onside.request.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * LeagueRequestDto
 *
 * Submitted when someone wants to add their league to Onside.
 * Sent to onsideussoccer.com@onsideussoccer.com via email — no DB storage.
 */
public record LeagueSubmissionRequestDto(

        @NotBlank(message = "League name is required")
        @Size(max = 150)
        String leagueName,

        @NotBlank(message = "Contact name is required")
        @Size(max = 100)
        String contactName,

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        String contactEmail,

        String contactPhone,

        String city,

        @Size(max = 2)
        String state,

        // e.g. "Men's Recreational", "Youth U12-U18", "Co-Ed Indoor"
        String leagueType,

        // Approximate number of teams currently in the league
        Integer teamCount,

        String message
) {}