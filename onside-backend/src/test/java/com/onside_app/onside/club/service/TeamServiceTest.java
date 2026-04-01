package com.onside_app.onside.club.service;

import com.onside_app.onside.club.dto.*;
import com.onside_app.onside.club.entity.Club;
import com.onside_app.onside.club.entity.Team;
import com.onside_app.onside.club.repository.ClubRepository;
import com.onside_app.onside.club.repository.ClubStaffRepository;
import com.onside_app.onside.club.repository.TeamRepository;
import com.onside_app.onside.club.repository.TeamRosterRepository;
import com.onside_app.onside.common.enums.*;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TeamServiceTest {

    @Mock TeamRepository teamRepository;
    @Mock ClubRepository clubRepository;
    @Mock ClubStaffRepository clubStaffRepository;
    @Mock TeamRosterRepository teamRosterRepository;
    @Mock UserRepository userRepository;

    @InjectMocks TeamService teamService;

    private static final UUID CLUB_ID  = UUID.randomUUID();
    private static final UUID TEAM_ID  = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID OTHER_ID = UUID.randomUUID();

    private Club testClub;
    private Team testTeam;

    @BeforeEach
    void setUp() {
        testClub = Club.builder()
                .id(CLUB_ID)
                .name("FC Test")
                .slug("fc-test")
                .build();

        testTeam = Team.builder()
                .id(TEAM_ID)
                .club(testClub)
                .name("Varsity Men")
                .slug("varsity-men")
                .genderCategory(GenderCategory.MEN)
                .skillLevel(SkillLevel.ADVANCED)
                .leagueType(LeagueType.RECREATIONAL)
                .isActive(true)
                .build();
    }

    // ── getTeamsByClub ────────────────────────────────────────────────────────

    @Test
    void getTeamsByClub_found_returnsDtoList() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(teamRepository.findByClubIdAndIsActiveTrueOrderByNameAsc(CLUB_ID))
                .thenReturn(List.of(testTeam));

        List<TeamResponseDto> result = teamService.getTeamsByClub("fc-test");

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().name()).isEqualTo("Varsity Men");
    }

    @Test
    void getTeamsByClub_clubNotFound_throwsIllegalArgumentException() {
        when(clubRepository.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.getTeamsByClub("ghost"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Club not found");
    }

    // ── getTeam ───────────────────────────────────────────────────────────────

    @Test
    void getTeam_found_returnsDto() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(teamRepository.findByClubIdAndSlug(CLUB_ID, "varsity-men"))
                .thenReturn(Optional.of(testTeam));

        TeamResponseDto dto = teamService.getTeam("fc-test", "varsity-men");

        assertThat(dto.slug()).isEqualTo("varsity-men");
        assertThat(dto.genderCategory()).isEqualTo(GenderCategory.MEN);
    }

    @Test
    void getTeam_teamNotFound_throwsIllegalArgumentException() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(teamRepository.findByClubIdAndSlug(CLUB_ID, "ghost"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.getTeam("fc-test", "ghost"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Team not found");
    }

    // ── browseTeams ───────────────────────────────────────────────────────────

    @Test
    void browseTeams_recruitingWithCategory_usesRecruitingAndCategoryQuery() {
        when(teamRepository.findByGenderCategoryAndIsRecruitingTrueAndIsActiveTrueOrderByNameAsc(
                GenderCategory.WOMEN)).thenReturn(List.of(testTeam));

        List<TeamResponseDto> result = teamService.browseTeams(
                GenderCategory.WOMEN, null, null, true);

        assertThat(result).hasSize(1);
        verify(teamRepository).findByGenderCategoryAndIsRecruitingTrueAndIsActiveTrueOrderByNameAsc(
                GenderCategory.WOMEN);
    }

    @Test
    void browseTeams_recruitingNoCategory_usesRecruitingOnlyQuery() {
        when(teamRepository.findByIsRecruitingTrueAndIsActiveTrueOrderByNameAsc())
                .thenReturn(List.of(testTeam));

        teamService.browseTeams(null, null, null, true);

        verify(teamRepository).findByIsRecruitingTrueAndIsActiveTrueOrderByNameAsc();
    }

    @Test
    void browseTeams_categoryAndState_usesCategoryStateQuery() {
        when(teamRepository.findByGenderCategoryAndStateAndIsActiveTrueOrderByNameAsc(
                GenderCategory.MEN, "OR")).thenReturn(List.of(testTeam));

        teamService.browseTeams(GenderCategory.MEN, null, "or", false);

        verify(teamRepository).findByGenderCategoryAndStateAndIsActiveTrueOrderByNameAsc(
                GenderCategory.MEN, "OR");
    }

    @Test
    void browseTeams_categoryAndLevel_usesCategoryLevelQuery() {
        when(teamRepository.findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                GenderCategory.MEN, SkillLevel.ADVANCED)).thenReturn(List.of());

        teamService.browseTeams(GenderCategory.MEN, SkillLevel.ADVANCED, null, false);

        verify(teamRepository).findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                GenderCategory.MEN, SkillLevel.ADVANCED);
    }

    @Test
    void browseTeams_noFilters_returnsAllActive() {
        when(teamRepository.findAll()).thenReturn(List.of(testTeam));

        List<TeamResponseDto> result = teamService.browseTeams(null, null, null, null);

        assertThat(result).hasSize(1);
        verify(teamRepository).findAll();
    }

    // ── searchTeams ───────────────────────────────────────────────────────────

    @Test
    void searchTeams_withQueryAndCategory_searchesByNameAndCategory() {
        when(teamRepository.searchByNameAndCategory("Varsity", GenderCategory.MEN))
                .thenReturn(List.of(testTeam));

        List<TeamResponseDto> result = teamService.searchTeams("Varsity", GenderCategory.MEN);

        assertThat(result).hasSize(1);
    }

    @Test
    void searchTeams_withQueryNoCategory_searchesByNameOnly() {
        when(teamRepository.searchByName("Varsity")).thenReturn(List.of(testTeam));

        teamService.searchTeams("Varsity", null);

        verify(teamRepository).searchByName("Varsity");
    }

    @Test
    void searchTeams_blankQuery_delegatesToBrowse() {
        when(teamRepository.findAll()).thenReturn(List.of());

        teamService.searchTeams("  ", null);

        verify(teamRepository).findAll();
        verify(teamRepository, never()).searchByName(any());
    }

    // ── createTeam ────────────────────────────────────────────────────────────

    @Test
    void createTeam_success_savesTeamAndReturnsDto() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(teamRepository.existsByClubIdAndSlug(eq(CLUB_ID), anyString())).thenReturn(false);
        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> inv.getArgument(0));

        TeamRequestDto req = new TeamRequestDto(
                "Varsity Men", null, GenderCategory.MEN, SkillLevel.ADVANCED,
                null, null, "Portland", "or", null, null, null, null, false);

        TeamResponseDto result = teamService.createTeam("fc-test", req, OWNER_ID);

        assertThat(result.name()).isEqualTo("Varsity Men");
        assertThat(result.genderCategory()).isEqualTo(GenderCategory.MEN);
    }

    @Test
    void createTeam_stateUppercased() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(teamRepository.existsByClubIdAndSlug(eq(CLUB_ID), anyString())).thenReturn(false);
        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> inv.getArgument(0));

        TeamRequestDto req = new TeamRequestDto(
                "Varsity Men", null, GenderCategory.MEN, SkillLevel.ADVANCED,
                null, null, null, "or", null, null, null, null, false);

        teamService.createTeam("fc-test", req, OWNER_ID);

        ArgumentCaptor<Team> captor = ArgumentCaptor.forClass(Team.class);
        verify(teamRepository).save(captor.capture());
        assertThat(captor.getValue().getState()).isEqualTo("OR");
    }

    @Test
    void createTeam_notAdminOrOwner_throwsSecurityException() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.OWNER)).thenReturn(false);
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.ADMIN)).thenReturn(false);

        TeamRequestDto req = new TeamRequestDto(
                "Varsity Men", null, GenderCategory.MEN, SkillLevel.ADVANCED,
                null, null, null, null, null, null, null, null, false);

        assertThatThrownBy(() -> teamService.createTeam("fc-test", req, OTHER_ID))
                .isInstanceOf(SecurityException.class);
    }

    // ── deactivateTeam ────────────────────────────────────────────────────────

    @Test
    void deactivateTeam_success_setsInactive() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(teamRepository.findByClubIdAndSlug(CLUB_ID, "varsity-men"))
                .thenReturn(Optional.of(testTeam));

        teamService.deactivateTeam("fc-test", "varsity-men", OWNER_ID);

        assertThat(testTeam.isActive()).isFalse();
        verify(teamRepository).save(testTeam);
    }

    // ── addRosterMember ───────────────────────────────────────────────────────

    @Test
    void addRosterMember_duplicateRole_throwsIllegalStateException() {
        User targetUser = User.builder().id(OTHER_ID).email("player@onside.app").build();

        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(teamRepository.findByClubIdAndSlug(CLUB_ID, "varsity-men"))
                .thenReturn(Optional.of(testTeam));
        when(userRepository.findByEmailIgnoreCase("player@onside.app"))
                .thenReturn(Optional.of(targetUser));
        when(teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                TEAM_ID, OTHER_ID, TeamRosterRole.PLAYER)).thenReturn(true);

        AddRosterMemberRequestDto req = new AddRosterMemberRequestDto(
                "player@onside.app", TeamRosterRole.PLAYER, null, null);

        assertThatThrownBy(() ->
                teamService.addRosterMember("fc-test", "varsity-men", req, OWNER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already has role");
    }

    @Test
    void addRosterMember_jerseyNumberTaken_throwsIllegalStateException() {
        User targetUser = User.builder().id(OTHER_ID).email("player@onside.app").build();

        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(teamRepository.findByClubIdAndSlug(CLUB_ID, "varsity-men"))
                .thenReturn(Optional.of(testTeam));
        when(userRepository.findByEmailIgnoreCase("player@onside.app"))
                .thenReturn(Optional.of(targetUser));
        when(teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                TEAM_ID, OTHER_ID, TeamRosterRole.PLAYER)).thenReturn(false);
        when(teamRosterRepository.existsByTeamIdAndJerseyNumberAndLeftAtIsNull(
                eq(TEAM_ID), any(Short.class))).thenReturn(true);

        AddRosterMemberRequestDto req = new AddRosterMemberRequestDto(
                "player@onside.app", TeamRosterRole.PLAYER, null, (short) 10);

        assertThatThrownBy(() ->
                teamService.addRosterMember("fc-test", "varsity-men", req, OWNER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Jersey number");
    }

    // ── removeRosterMember ────────────────────────────────────────────────────

    @Test
    void removeRosterMember_notActiveMember_throwsIllegalArgumentException() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(testClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(teamRepository.findByClubIdAndSlug(CLUB_ID, "varsity-men"))
                .thenReturn(Optional.of(testTeam));
        when(teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                TEAM_ID, OTHER_ID, TeamRosterRole.PLAYER)).thenReturn(false);
        when(teamRosterRepository.existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
                TEAM_ID, OTHER_ID, TeamRosterRole.COACH)).thenReturn(false);

        assertThatThrownBy(() ->
                teamService.removeRosterMember("fc-test", "varsity-men", OTHER_ID, OWNER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not an active member");
    }

    // ── getTeamsByLeague ──────────────────────────────────────────────────────

    @Test
    void getTeamsByLeague_returnsMappedDtos() {
        when(teamRepository.findByLeagueSlug("premier-league"))
                .thenReturn(List.of(testTeam));

        List<TeamResponseDto> result = teamService.getTeamsByLeague("premier-league");

        assertThat(result).hasSize(1);
        verify(teamRepository).findByLeagueSlug("premier-league");
    }
}
