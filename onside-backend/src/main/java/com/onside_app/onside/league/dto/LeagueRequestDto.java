package com.onside_app.onside.league.dto;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LeagueRequestDto(

        @NotBlank @Size(max = 150)
        String name,

        @Size(max = 30)
        String shortName,

        @NotNull
        GenderCategory genderCategory,

        @NotNull
        SkillLevel skillLevel,

        // NEW: leagueType is required when creating/updating a league.
        // Defaults to RECREATIONAL if not provided (null-safe in service).
        @NotNull
        LeagueType leagueType,

        String description,
        Short foundedYear,
        String website,
        String logoUrl
) {}