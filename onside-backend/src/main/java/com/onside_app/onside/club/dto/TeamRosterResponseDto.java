package com.onside_app.onside.club.dto;

import com.onside_app.onside.club.entity.TeamRoster;
import com.onside_app.onside.common.enums.PlayerPosition;
import com.onside_app.onside.common.enums.TeamRosterRole;

import java.time.LocalDate;
import java.util.UUID;

public record TeamRosterResponseDto(
        UUID id,
        UUID userId,
        String userEmail,
        String firstName,
        String lastName,
        TeamRosterRole role,
        PlayerPosition position,
        Short jerseyNumber,
        LocalDate joinedAt,
        boolean isActive
) {
    public static TeamRosterResponseDto from(TeamRoster roster) {
        String firstName = null;
        String lastName = null;

        // Profile may not be loaded in all contexts — guard against null
        if (roster.getUser().getProfile() != null) {
            firstName = roster.getUser().getProfile().getFirstName();
            lastName  = roster.getUser().getProfile().getLastName();
        }

        return new TeamRosterResponseDto(
                roster.getId(),
                roster.getUser().getId(),
                roster.getUser().getEmail(),
                firstName,
                lastName,
                roster.getRole(),
                roster.getPosition(),
                roster.getJerseyNumber(),
                roster.getJoinedAt(),
                roster.isActive()
        );
    }
}