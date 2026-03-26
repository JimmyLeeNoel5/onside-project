package com.onside_app.onside.league.dto;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import com.onside_app.onside.league.entity.League;

import java.util.UUID;

public record LeagueResponseDto(
        UUID id,
        String name,
        String shortName,
        String slug,
        GenderCategory genderCategory,
        SkillLevel skillLevel,
        // NEW: leagueType added so the frontend can filter by section
        LeagueType leagueType,
        String description,
        Short foundedYear,
        String website,
        String logoUrl,
        boolean isActive
) {
    // Factory method — converts entity to DTO.
    // leagueType is added in the same position as declared above.
    public static LeagueResponseDto from(League league) {
        return new LeagueResponseDto(
                league.getId(),
                league.getName(),
                league.getShortName(),
                league.getSlug(),
                league.getGenderCategory(),
                league.getSkillLevel(),
                league.getLeagueType(),
                league.getDescription(),
                league.getFoundedYear(),
                league.getWebsite(),
                league.getLogoUrl(),
                league.isActive()
        );
    }
}