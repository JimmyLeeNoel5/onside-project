package com.onside_app.onside.club.dto;

import com.onside_app.onside.club.entity.ClubStaff;
import com.onside_app.onside.common.enums.ClubStaffRole;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ClubStaffResponseDto(
        UUID id,
        UUID userId,
        String userEmail,
        ClubStaffRole role,
        boolean isActive
) {
    public static ClubStaffResponseDto from(ClubStaff staff) {
        return new ClubStaffResponseDto(
                staff.getId(),
                staff.getUser().getId(),
                staff.getUser().getEmail(),
                staff.getRole(),
                staff.isActive()
        );
    }
}