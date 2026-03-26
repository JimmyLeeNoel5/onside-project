package com.onside_app.onside.club.dto;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClubRequestDto(

        @NotBlank(message = "Club name is required")
        @Size(max = 150, message = "Name must not exceed 150 characters")
        String name,

        @Size(max = 30, message = "Short name must not exceed 30 characters")
        String shortName,

        String description,

        @Size(max = 255, message = "Website must not exceed 255 characters")
        String website,

        @Size(max = 500, message = "Logo URL must not exceed 500 characters")
        String logoUrl,

        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @Size(max = 2, message = "State must be a 2-letter code")
        String state,

        Short foundedYear
) {}