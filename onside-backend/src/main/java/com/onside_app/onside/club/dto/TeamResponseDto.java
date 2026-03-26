package com.onside_app.onside.club.dto;

import com.onside_app.onside.club.entity.Team;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.SkillLevel;

import java.util.UUID;

public record TeamResponseDto(
        UUID id,
        String name,
        String shortName,
        String slug,
        UUID clubId,
        String clubName,
        String clubSlug,
        GenderCategory genderCategory,
        SkillLevel skillLevel,
        String description,
        String city,
        String state,
        String primaryColor,
        String secondaryColor,
        String logoUrl,
        String homeVenue,
        boolean isRecruiting,
        boolean isActive
) {
    public static TeamResponseDto from(Team team) {
        return new TeamResponseDto(
                team.getId(),
                team.getName(),
                team.getShortName(),
                team.getSlug(),
                team.getClub().getId(),
                team.getClub().getName(),
                team.getClub().getSlug(),
                team.getGenderCategory(),
                team.getSkillLevel(),
                team.getDescription(),
                team.getCity(),
                team.getState(),
                team.getPrimaryColor(),
                team.getSecondaryColor(),
                team.getLogoUrl(),
                team.getHomeVenue(),
                team.isRecruiting(),
                team.isActive()
        );
    }
}
