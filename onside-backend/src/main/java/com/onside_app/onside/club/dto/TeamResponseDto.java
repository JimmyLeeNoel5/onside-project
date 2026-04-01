package com.onside_app.onside.club.dto;

import com.onside_app.onside.club.entity.Team;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import com.onside_app.onside.league.entity.League;

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
        boolean isActive,
        LeagueType leagueType,
        String leagueName,
        String leagueSlug
) {
    public static TeamResponseDto from(Team team) {
        // Prefer current season's league; fall back to any active season's league
        League activeLeague = team.getSeasonTeams().stream()
                .filter(st -> st.isActive() && st.getSeason().isCurrent())
                .map(st -> st.getSeason().getLeague())
                .findFirst()
                .orElseGet(() -> team.getSeasonTeams().stream()
                        .filter(st -> st.isActive() && st.getSeason().isActive())
                        .map(st -> st.getSeason().getLeague())
                        .findFirst()
                        .orElse(null));

        // League's type takes priority; fall back to the team's own standalone leagueType
        LeagueType effectiveLeagueType = activeLeague != null
                ? activeLeague.getLeagueType()
                : team.getLeagueType();

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
                team.isActive(),
                effectiveLeagueType,
                activeLeague != null ? activeLeague.getName() : null,
                activeLeague != null ? activeLeague.getSlug() : null
        );
    }
}
