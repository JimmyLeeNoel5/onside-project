package com.onside_app.onside.users.service;

import com.onside_app.onside.common.exception.ResourceNotFoundException;
import com.onside_app.onside.users.dto.UserResponseDto;
import com.onside_app.onside.users.dto.UserUpdateDto;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.entity.UserProfile;
import com.onside_app.onside.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── GET /users/me ──────────────────────────────────────────────────────────

    /**
     * Returns the full profile for the logged-in user.
     *
     * Why @Transactional(readOnly = true)?
     * UserProfile is loaded LAZILY from User (fetch = FetchType.LAZY).
     * Without @Transactional, the Hibernate session closes before we access
     * user.getProfile(), causing a LazyInitializationException.
     * readOnly = true gives a small performance boost (no dirty checking).
     */
    @Transactional(readOnly = true)
    public UserResponseDto getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Safe to access lazy relationship here — session is still open
        UserProfile profile = user.getProfile();

        return mapToDto(user, profile);
    }

    // ── PUT /users/me ──────────────────────────────────────────────────────────

    /**
     * Partial update — only fields that are non-null in the request are saved.
     *
     * Why no explicit save() call?
     * profile is a managed JPA entity inside a @Transactional method.
     * Hibernate detects the changes made via setters and runs UPDATE SQL
     * automatically when the transaction commits. @PreUpdate on UserProfile
     * fires too, updating the updatedAt timestamp.
     *
     * Why the null checks?
     * Records are immutable — we can't mutate the DTO. But we can read each
     * component via its accessor (e.g. request.firstName()) and only apply
     * it to the profile entity if it's non-null.
     */
    @Transactional
    public UserResponseDto updateMe(UUID userId, UserUpdateDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = user.getProfile();

        // ── Personal info ──────────────────────────────────────────────────────
        // Records use accessor methods (no "get" prefix) — request.firstName()
        // not request.getFirstName(). This is the main syntax change from the
        // Lombok @Getter version.
        if (request.firstName() != null)         profile.setFirstName(request.firstName());
        if (request.lastName() != null)          profile.setLastName(request.lastName());
        if (request.phone() != null)             profile.setPhone(request.phone());
        if (request.dateOfBirth() != null)       profile.setDateOfBirth(request.dateOfBirth());
        if (request.bio() != null)               profile.setBio(request.bio());
        if (request.avatarUrl() != null)         profile.setAvatarUrl(request.avatarUrl());

        // ── Location ───────────────────────────────────────────────────────────
        if (request.city() != null)              profile.setCity(request.city());
        if (request.state() != null)             profile.setState(request.state());
        if (request.zipCode() != null)           profile.setZipCode(request.zipCode());

        // ── Soccer info ────────────────────────────────────────────────────────
        if (request.primaryPosition() != null)    profile.setPrimaryPosition(request.primaryPosition());
        if (request.secondaryPosition() != null)  profile.setSecondaryPosition(request.secondaryPosition());
        if (request.skillLevel() != null)         profile.setSkillLevel(request.skillLevel());
        if (request.dominantFoot() != null)       profile.setDominantFoot(request.dominantFoot());
        if (request.preferredGenderCat() != null) profile.setPreferredGenderCat(request.preferredGenderCat());
        if (request.jerseyNumber() != null)       profile.setJerseyNumber(request.jerseyNumber());

        // ── Social links ───────────────────────────────────────────────────────
        if (request.instagramUrl() != null)       profile.setInstagramUrl(request.instagramUrl());
        if (request.twitterUrl() != null)         profile.setTwitterUrl(request.twitterUrl());
        if (request.tiktokUrl() != null)          profile.setTiktokUrl(request.tiktokUrl());
        if (request.youtubeUrl() != null)         profile.setYoutubeUrl(request.youtubeUrl());
        if (request.personalWebsiteUrl() != null) profile.setPersonalWebsiteUrl(request.personalWebsiteUrl());

        // ── Preferences ────────────────────────────────────────────────────────
        if (request.receiveEmailAlerts() != null) profile.setReceiveEmailAlerts(request.receiveEmailAlerts());
        if (request.receiveSmsAlerts() != null)   profile.setReceiveSmsAlerts(request.receiveSmsAlerts());
        if (request.profileIsPublic() != null)    profile.setProfileIsPublic(request.profileIsPublic());

        return mapToDto(user, profile);
    }

    // ── Private mapper ─────────────────────────────────────────────────────────

    /**
     * Converts User + UserProfile entities into a UserResponseDto record.
     *
     * Records don't have a builder — we use the canonical constructor directly,
     * passing all fields in the exact order they're declared in the record.
     *
     * Enum → String conversion:
     * We call .name() on each enum to get its string representation
     * (e.g. PlayerPosition.MIDFIELDER → "MIDFIELDER"). Null-checked first
     * to avoid NullPointerException on optional fields.
     */
    private UserResponseDto mapToDto(User user, UserProfile profile) {
        return new UserResponseDto(
                // From User entity
                user.getId(),
                user.getEmail(),
                user.getAuthProvider().name(),
                user.isEmailVerified(),

                // From UserProfile entity — personal info
                profile.getFirstName(),
                profile.getLastName(),
                profile.getPhone(),
                profile.getDateOfBirth(),
                profile.getAvatarUrl(),
                profile.getBio(),

                // Location
                profile.getCity(),
                profile.getState(),
                profile.getZipCode(),

                // Soccer info — enum → string (null-safe)
                profile.getPrimaryPosition()    != null ? profile.getPrimaryPosition().name()    : null,
                profile.getSecondaryPosition()  != null ? profile.getSecondaryPosition().name()  : null,
                profile.getSkillLevel()         != null ? profile.getSkillLevel().name()         : null,
                profile.getDominantFoot()       != null ? profile.getDominantFoot().name()       : null,
                profile.getPreferredGenderCat() != null ? profile.getPreferredGenderCat().name() : null,
                profile.getJerseyNumber(),

                // Social links
                profile.getInstagramUrl(),
                profile.getTwitterUrl(),
                profile.getTiktokUrl(),
                profile.getYoutubeUrl(),
                profile.getPersonalWebsiteUrl(),

                // Preferences
                profile.isReceiveEmailAlerts(),
                profile.isReceiveSmsAlerts(),
                profile.isProfileIsPublic()
        );
    }
}