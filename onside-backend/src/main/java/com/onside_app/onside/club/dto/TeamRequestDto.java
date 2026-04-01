package com.onside_app.onside.club.dto;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TeamRequestDto(

        @NotBlank(message = "Team name is required")
        @Size(max = 150, message = "Name must not exceed 150 characters")
        String name,

        @Size(max = 30, message = "Short name must not exceed 30 characters")
        String shortName,

        @NotNull(message = "Gender category is required")
        GenderCategory genderCategory,

        @NotNull(message = "Skill level is required")
        SkillLevel skillLevel,

        LeagueType leagueType,

        String description,

        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @Size(max = 2, message = "State must be a 2-letter code")
        String state,

        @Size(max = 7, message = "Primary color must be a hex code e.g. #FF0000")
        String primaryColor,

        @Size(max = 7, message = "Secondary color must be a hex code e.g. #FFFFFF")
        String secondaryColor,

        @Size(max = 500, message = "Logo URL must not exceed 500 characters")
        String logoUrl,

        @Size(max = 255, message = "Home venue must not exceed 255 characters")
        String homeVenue,

        boolean isRecruiting
) {}