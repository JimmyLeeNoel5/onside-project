package com.onside_app.onside.event.dto;

import com.onside_app.onside.common.enums.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

public record EventRequest(

        @NotBlank @Size(max = 200)
        String name,

        @NotNull
        EventType type,

        String description,
        GenderCategory genderCategory,
        SkillLevel skillLevel,

        UUID hostClubId,

        String venueName,
        String addressLine1,
        String addressLine2,
        String city,

        @Size(min = 2, max = 2)
        String state,

        String zipCode,

        @NotNull
        LocalDate startDate,

        LocalDate endDate,
        LocalTime startTime,
        LocalTime endTime,
        OffsetDateTime registrationOpensAt,
        OffsetDateTime registrationClosesAt,

        Short capacity,
        boolean waitlistEnabled,
        Short waitlistCapacity,

        BigDecimal individualFee,
        BigDecimal teamFee,

        boolean allowsIndividualReg,
        boolean allowsTeamReg,

        UUID leagueId,
        UUID seasonId,

        Short minAge,
        Short maxAge,

        String imageUrl,
        String website,

        @Email
        String contactEmail,

        String contactPhone,
        boolean isPublished
) {}