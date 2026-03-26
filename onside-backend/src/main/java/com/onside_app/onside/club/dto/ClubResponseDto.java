package com.onside_app.onside.club.dto;

import com.onside_app.onside.club.entity.Club;

import java.util.UUID;

public record ClubResponseDto(
        UUID id,
        String name,
        String shortName,
        String slug,
        String description,
        String website,
        String logoUrl,
        String city,
        String state,
        Short foundedYear,
        boolean isVerified,
        boolean isActive
) {
    public static ClubResponseDto from(Club club) {
        return new ClubResponseDto(
                club.getId(),
                club.getName(),
                club.getShortName(),
                club.getSlug(),
                club.getDescription(),
                club.getWebsite(),
                club.getLogoUrl(),
                club.getCity(),
                club.getState(),
                club.getFoundedYear(),
                club.isVerified(),
                club.isActive()
        );
    }
}