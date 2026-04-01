package com.onside_app.onside.club.service;

import com.onside_app.onside.club.dto.*;
import com.onside_app.onside.club.entity.Club;
import com.onside_app.onside.club.entity.Team;
import com.onside_app.onside.club.entity.TeamRoster;
import com.onside_app.onside.club.repository.ClubRepository;
import com.onside_app.onside.club.repository.ClubStaffRepository;
import com.onside_app.onside.club.repository.TeamRepository;
import com.onside_app.onside.club.repository.TeamRosterRepository;
import com.onside_app.onside.common.enums.ClubStaffRole;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.SkillLevel;
import com.onside_app.onside.common.util.SlugUtils;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final ClubRepository clubRepository;
    private final ClubStaffRepository clubStaffRepository;
    private final TeamRosterRepository teamRosterRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository,
                       ClubRepository clubRepository,
                       ClubStaffRepository clubStaffRepository,
                       TeamRosterRepository teamRosterRepository,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.clubRepository = clubRepository;
        this.clubStaffRepository = clubStaffRepository;
        this.teamRosterRepository = teamRosterRepository;
        this.userRepository = userRepository;
    }

    // ── Get all teams for a club ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeamResponseDto> getTeamsByClub(String clubSlug) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        return teamRepository
                .findByClubIdAndIsActiveTrueOrderByNameAsc(club.getId())
                .stream().map(TeamResponseDto::from).toList();
    }

    // ── Get single team ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TeamResponseDto getTeam(String clubSlug, String teamSlug) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        Team team = teamRepository
                .findByClubIdAndSlug(club.getId(), teamSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Team not found: " + teamSlug));

        return TeamResponseDto.from(team);
    }

    // ── Browse teams globally ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeamResponseDto> browseTeams(GenderCategory category,
                                             SkillLevel level,
                                             String state,
                                             Boolean recruiting) {
        List<Team> teams;

        if (Boolean.TRUE.equals(recruiting) && category != null) {
            teams = teamRepository
                    .findByGenderCategoryAndIsRecruitingTrueAndIsActiveTrueOrderByNameAsc(
                            category);
        } else if (Boolean.TRUE.equals(recruiting)) {
            teams = teamRepository
                    .findByIsRecruitingTrueAndIsActiveTrueOrderByNameAsc();
        } else if (category != null && state != null) {
            teams = teamRepository
                    .findByGenderCategoryAndStateAndIsActiveTrueOrderByNameAsc(
                            category, state.toUpperCase());
        } else if (category != null && level != null) {
            teams = teamRepository
                    .findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                            category, level);
        } else if (category != null) {
            teams = teamRepository
                    .findByGenderCategoryAndIsActiveTrueOrderByNameAsc(category);
        } else if (state != null) {
            teams = teamRepository
                    .findByStateAndIsActiveTrueOrderByNameAsc(state.toUpperCase());
        } else {
            // No filters — return all active teams
            teams = teamRepository.findAll().stream()
                    .filter(Team::isActive)
                    .toList();
        }

        return teams.stream().map(TeamResponseDto::from).toList();
    }

    // ── Get teams by league ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeamResponseDto> getTeamsByLeague(String leagueSlug) {
        return teamRepository.findByLeagueSlug(leagueSlug)
                .stream().map(TeamResponseDto::from).toList();
    }

    // ── Search teams ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeamResponseDto> searchTeams(String query,
                                             GenderCategory category) {
        if (query == null || query.isBlank()) {
            return browseTeams(category, null, null, null);
        }

        List<Team> teams = (category != null)
                ? teamRepository.searchByNameAndCategory(query.trim(), category)
                : teamRepository.searchByName(query.trim());

        return teams.stream().map(TeamResponseDto::from).toList();
    }

    // ── Get active roster for a team ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeamRosterResponseDto> getActiveRoster(String clubSlug,
                                                       String teamSlug) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        Team team = teamRepository
                .findByClubIdAndSlug(club.getId(), teamSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Team not found: " + teamSlug));

        return teamRosterRepository
                .findActiveRosterWithUserDetails(team.getId())
                .stream().map(TeamRosterResponseDto::from).toList();
    }

    // ── Create team ────────────────────────────────────────────────────────────

    @Transactional
    public TeamResponseDto createTeam(String clubSlug,
                                      TeamRequestDto request,
                                      UUID requestingUserId) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        String slug = SlugUtils.toUniqueSlug(
                request.name(),
                s -> teamRepository.existsByClubIdAndSlug(club.getId(), s)
        );

        Team team = Team.builder()
                .club(club)
                .name(request.name().strip())
                .shortName(request.shortName() != null
                        ? request.shortName().strip() : null)
                .slug(slug)
                .genderCategory(request.genderCategory())
                .skillLevel(request.skillLevel())
                .leagueType(request.leagueType())
                .description(request.description())
                .city(request.city())
                .state(request.state() != null
                        ? request.state().toUpperCase() : null)
                .primaryColor(request.primaryColor())
                .secondaryColor(request.secondaryColor())
                .logoUrl(request.logoUrl())
                .homeVenue(request.homeVenue())
                .isRecruiting(request.isRecruiting())
                .build();

        return TeamResponseDto.from(teamRepository.save(team));
    }

    // ── Update team ────────────────────────────────────────────────────────────

    @Transactional
    public TeamResponseDto updateTeam(String clubSlug,
                                      String teamSlug,
                                      TeamRequestDto request,
                                      UUID requestingUserId) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        Team team = teamRepository
                .findByClubIdAndSlug(club.getId(), teamSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Team not found: " + teamSlug));

        if (!team.getName().equalsIgnoreCase(request.name().strip())) {
            String newSlug = SlugUtils.toUniqueSlug(
                    request.name(),
                    s -> !s.equals(team.getSlug())
                            && teamRepository.existsByClubIdAndSlug(club.getId(), s)
            );
            team.setSlug(newSlug);
        }

        team.setName(request.name().strip());
        team.setShortName(request.shortName() != null
                ? request.shortName().strip() : null);
        team.setGenderCategory(request.genderCategory());
        team.setSkillLevel(request.skillLevel());
        team.setLeagueType(request.leagueType());
        team.setDescription(request.description());
        team.setCity(request.city());
        team.setState(request.state() != null
                ? request.state().toUpperCase() : null);
        team.setPrimaryColor(request.primaryColor());
        team.setSecondaryColor(request.secondaryColor());
        team.setLogoUrl(request.logoUrl());
        team.setHomeVenue(request.homeVenue());
        team.setRecruiting(request.isRecruiting());

        return TeamResponseDto.from(teamRepository.save(team));
    }

    // ── Deactivate team ────────────────────────────────────────────────────────

    @Transactional
    public void deactivateTeam(String clubSlug,
                               String teamSlug,
                               UUID requestingUserId) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        Team team = teamRepository
                .findByClubIdAndSlug(club.getId(), teamSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Team not found: " + teamSlug));

        team.setActive(false);
        teamRepository.save(team);
    }

    // ── Add roster member ──────────────────────────────────────────────────────

    @Transactional
    public TeamRosterResponseDto addRosterMember(String clubSlug,
                                                 String teamSlug,
                                                 AddRosterMemberRequestDto request,
                                                 UUID requestingUserId) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        Team team = teamRepository
                .findByClubIdAndSlug(club.getId(), teamSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Team not found: " + teamSlug));

        User targetUser = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No user found with email: " + request.email()));

        // Prevent duplicate active role on same team
        if (teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                team.getId(), targetUser.getId(), request.role())) {
            throw new IllegalStateException(
                    "User already has role " + request.role()
                            + " on this team");
        }

        // Check jersey number availability
        if (request.jerseyNumber() != null &&
                teamRosterRepository.existsByTeamIdAndJerseyNumberAndLeftAtIsNull(
                        team.getId(), request.jerseyNumber())) {
            throw new IllegalStateException(
                    "Jersey number " + request.jerseyNumber()
                            + " is already taken on this team");
        }

        TeamRoster roster = TeamRoster.builder()
                .team(team)
                .user(targetUser)
                .role(request.role())
                .position(request.position())
                .jerseyNumber(request.jerseyNumber())
                .joinedAt(LocalDate.now())
                .build();

        return TeamRosterResponseDto.from(teamRosterRepository.save(roster));
    }

    // ── Remove roster member ───────────────────────────────────────────────────

    @Transactional
    public void removeRosterMember(String clubSlug,
                                   String teamSlug,
                                   UUID targetUserId,
                                   UUID requestingUserId) {
        Club club = clubRepository.findBySlug(clubSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Club not found: " + clubSlug));

        assertClubAdminOrOwner(club.getId(), requestingUserId);

        Team team = teamRepository
                .findByClubIdAndSlug(club.getId(), teamSlug)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Team not found: " + teamSlug));

        if (!teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                team.getId(), targetUserId,
                com.onside_app.onside.common.enums.TeamRosterRole.PLAYER)
                && !teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                team.getId(), targetUserId,
                com.onside_app.onside.common.enums.TeamRosterRole.COACH)) {
            throw new IllegalArgumentException(
                    "User is not an active member of this team");
        }

        // leftAt = today, isActive = false for all active roles
        for (var role : com.onside_app.onside.common.enums.TeamRosterRole.values()) {
            if (teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                    team.getId(), targetUserId, role)) {
                teamRosterRepository.leaveTeam(
                        team.getId(), targetUserId, role, LocalDate.now());
            }
        }
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
}