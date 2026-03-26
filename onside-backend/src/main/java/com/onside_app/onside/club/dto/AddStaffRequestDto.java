package com.onside_app.onside.club.dto;

import com.onside_app.onside.common.enums.ClubStaffRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddStaffRequestDto(

        @NotBlank(message = "User email is required")
        @Email(message = "Must be a valid email address")
        String email,

        @NotNull(message = "Staff role is required")
        ClubStaffRole role
) {}
