package com.onside_app.onside.club.service;
import com.onside_app.onside.club.dto.*;
import com.onside_app.onside.club.entity.Club;
import com.onside_app.onside.club.entity.ClubStaff;
import com.onside_app.onside.club.repository.ClubRepository;
import com.onside_app.onside.club.repository.ClubStaffRepository;
import com.onside_app.onside.common.enums.ClubStaffRole;
import com.onside_app.onside.common.util.SlugUtils;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubStaffRepository clubStaffRepository;
    private final UserRepository userRepository;

    public ClubService(ClubRepository clubRepository,
                       ClubStaffRepository clubStaffRepository,
                       UserRepository userRepository) {
        this.clubRepository = clubRepository;
        this.clubStaffRepository = clubStaffRepository;
        this.userRepository = userRepository;
    }

    // ── Get all active clubs ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ClubResponseDto> getAllClubs(String state) {
        List<Club> clubs = (state != null && !state.isBlank())
                ? clubRepository.findByStateAndIsActiveTrueOrderByNameAsc(
                state.toUpperCase())
                : clubRepository.findByIsActiveTrueOrderByNameAsc();

        return clubs.stream().map(ClubResponseDto::from).toList();
    }

    // ── Get club by slug ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ClubResponseDto getClubBySlug(String slug) {
        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + slug));
        return ClubResponseDto.from(club);
    }

    // ── Search clubs ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ClubResponseDto> searchClubs(String query) {
        if (query == null || query.isBlank()) {
            return getAllClubs(null);
        }
        return clubRepository.searchByName(query.trim())
                .stream().map(ClubResponseDto::from).toList();
    }

    // ── Get clubs managed by the logged-in user ────────────────────────────────

    @Transactional(readOnly = true)
    public List<ClubResponseDto> getMyClubs(UUID userId) {
        return clubRepository.findByStaffUserId(userId)
                .stream().map(ClubResponseDto::from).toList();
    }

    // ── Get staff for a club ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ClubStaffResponseDto> getClubStaff(String slug) {
        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + slug));

        return clubStaffRepository
                .findByClubIdAndIsActiveTrueOrderByRoleAsc(club.getId())
                .stream().map(ClubStaffResponseDto::from).toList();
    }

    // ── Create club ────────────────────────────────────────────────────────────
    // The creating user automatically becomes the OWNER

    @Transactional
    public ClubResponseDto createClub(ClubRequestDto request, UUID creatorId) {
        String slug = SlugUtils.toUniqueSlug(
                request.name(),
                clubRepository::existsBySlug
        );

        Club club = Club.builder()
                .name(request.name().strip())
                .shortName(request.shortName() != null
                        ? request.shortName().strip() : null)
                .slug(slug)
                .description(request.description())
                .website(request.website())
                .logoUrl(request.logoUrl())
                .city(request.city())
                .state(request.state() != null
                        ? request.state().toUpperCase() : null)
                .foundedYear(request.foundedYear())
                .build();

        Club saved = clubRepository.save(club);

        // Auto-assign creator as OWNER
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found: " + creatorId));

        ClubStaff ownerStaff = ClubStaff.builder()
                .club(saved)
                .user(creator)
                .role(ClubStaffRole.OWNER)
                .build();

        clubStaffRepository.save(ownerStaff);

        return ClubResponseDto.from(saved);
    }

    // ── Update club ────────────────────────────────────────────────────────────

    @Transactional
    public ClubResponseDto updateClub(String slug,
                                      ClubRequestDto request,
                                      UUID requestingUserId) {
        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + slug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        if (!club.getName().equalsIgnoreCase(request.name().strip())) {
            String newSlug = SlugUtils.toUniqueSlug(
                    request.name(),
                    s -> !s.equals(club.getSlug())
                            && clubRepository.existsBySlug(s)
            );
            club.setSlug(newSlug);
        }

        club.setName(request.name().strip());
        club.setShortName(request.shortName() != null
                ? request.shortName().strip() : null);
        club.setDescription(request.description());
        club.setWebsite(request.website());
        club.setLogoUrl(request.logoUrl());
        club.setCity(request.city());
        club.setState(request.state() != null
                ? request.state().toUpperCase() : null);
        club.setFoundedYear(request.foundedYear());

        return ClubResponseDto.from(clubRepository.save(club));
    }

    // ── Deactivate club ────────────────────────────────────────────────────────

    @Transactional
    public void deactivateClub(String slug, UUID requestingUserId) {
        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + slug));

        assertClubOwner(club.getId(), requestingUserId);

        club.setActive(false);
        clubRepository.save(club);
    }

    // ── Add staff member ───────────────────────────────────────────────────────

    @Transactional
    public ClubStaffResponseDto addStaff(String slug,
                                         AddStaffRequestDto request,
                                         UUID requestingUserId) {
        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + slug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        User targetUser = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No user found with email: " + request.email()));

        // Prevent duplicate active role
        if (clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                club.getId(), targetUser.getId(), request.role())) {
            throw new IllegalStateException(
                    "User already has role " + request.role()
                            + " at this club");
        }

        // OWNER role cannot be assigned manually — it's set at club creation
        if (request.role() == ClubStaffRole.OWNER) {
            throw new IllegalArgumentException(
                    "OWNER role cannot be assigned manually");
        }

        ClubStaff staff = ClubStaff.builder()
                .club(club)
                .user(targetUser)
                .role(request.role())
                .build();

        return ClubStaffResponseDto.from(clubStaffRepository.save(staff));
    }

    // ── Remove staff member ────────────────────────────────────────────────────

    @Transactional
    public void removeStaff(String slug,
                            UUID targetUserId,
                            UUID requestingUserId) {
        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + slug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        // Cannot remove the owner
        if (clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                club.getId(), targetUserId, ClubStaffRole.OWNER)) {
            throw new IllegalStateException(
                    "Cannot remove the club owner");
        }

        clubStaffRepository.revokeAllForUserAtClub(
                club.getId(), targetUserId, OffsetDateTime.now());
    }

    // ── Authorization helpers ──────────────────────────────────────────────────

    private void assertClubAdminOrOwner(UUID clubId, UUID userId) {
        boolean isOwner = clubStaffRepository
                .existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                        clubId, userId, ClubStaffRole.OWNER);
        boolean isAdmin = clubStaffRepository
                .existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                        clubId, userId, ClubStaffRole.ADMIN);

        if (!isOwner && !isAdmin) {
            throw new SecurityException(
                    "You do not have permission to manage this club");
        }
    }

    private void assertClubOwner(UUID clubId, UUID userId) {
        boolean isOwner = clubStaffRepository
                .existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                        clubId, userId, ClubStaffRole.OWNER);

        if (!isOwner) {
            throw new SecurityException(
                    "Only the club owner can perform this action");
        }
    }
}
