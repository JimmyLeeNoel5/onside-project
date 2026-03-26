package com.onside_app.onside.club.dto;

import com.onside_app.onside.common.enums.PlayerPosition;
import com.onside_app.onside.common.enums.TeamRosterRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddRosterMemberRequestDto(

        @NotBlank(message = "User email is required")
        @Email(message = "Must be a valid email address")
        String email,

        @NotNull(message = "Roster role is required")
        TeamRosterRole role,

        PlayerPosition position,

        Short jerseyNumber
) {}