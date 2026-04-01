package com.onside_app.onside.club.service;

import com.onside_app.onside.club.dto.*;
import com.onside_app.onside.club.entity.Club;
import com.onside_app.onside.club.entity.ClubStaff;
import com.onside_app.onside.club.repository.ClubRepository;
import com.onside_app.onside.club.repository.ClubStaffRepository;
import com.onside_app.onside.common.enums.ClubStaffRole;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.repository.UserRepository;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ClubServiceTest {

    @Mock ClubRepository clubRepository;
    @Mock ClubStaffRepository clubStaffRepository;
    @Mock UserRepository userRepository;

    @InjectMocks ClubService clubService;

    private static final UUID CLUB_ID  = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID ADMIN_ID = UUID.randomUUID();
    private static final UUID OTHER_ID = UUID.randomUUID();

    private Club activeClub;
    private User ownerUser;

    @BeforeEach
    void setUp() {
        activeClub = Club.builder()
                .id(CLUB_ID)
                .name("FC Test")
                .slug("fc-test")
                .city("Portland")
                .state("OR")
                .isActive(true)
                .build();

        ownerUser = User.builder()
                .id(OWNER_ID)
                .email("owner@onside.app")
                .build();
    }

    // ── getAllClubs ────────────────────────────────────────────────────────────

    @Test
    void getAllClubs_noFilter_returnsAllActiveClubs() {
        when(clubRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(activeClub));

        List<ClubResponseDto> result = clubService.getAllClubs(null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("FC Test");
    }

    @Test
    void getAllClubs_withStateFilter_delegatesToStateQuery() {
        when(clubRepository.findByStateAndIsActiveTrueOrderByNameAsc("OR"))
                .thenReturn(List.of(activeClub));

        List<ClubResponseDto> result = clubService.getAllClubs("or");

        assertThat(result).hasSize(1);
        verify(clubRepository).findByStateAndIsActiveTrueOrderByNameAsc("OR");
        verify(clubRepository, never()).findByIsActiveTrueOrderByNameAsc();
    }

    @Test
    void getAllClubs_blankState_treatedAsNoFilter() {
        when(clubRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of());

        clubService.getAllClubs("   ");

        verify(clubRepository).findByIsActiveTrueOrderByNameAsc();
    }

    // ── getClubBySlug ─────────────────────────────────────────────────────────

    @Test
    void getClubBySlug_found_returnsDto() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));

        ClubResponseDto dto = clubService.getClubBySlug("fc-test");

        assertThat(dto.slug()).isEqualTo("fc-test");
        assertThat(dto.name()).isEqualTo("FC Test");
    }

    @Test
    void getClubBySlug_notFound_throwsIllegalArgumentException() {
        when(clubRepository.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clubService.getClubBySlug("ghost"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Club not found");
    }

    // ── searchClubs ───────────────────────────────────────────────────────────

    @Test
    void searchClubs_withQuery_delegatesToSearchByName() {
        when(clubRepository.searchByName("FC")).thenReturn(List.of(activeClub));

        List<ClubResponseDto> result = clubService.searchClubs("FC");

        assertThat(result).hasSize(1);
        verify(clubRepository).searchByName("FC");
    }

    @Test
    void searchClubs_blankQuery_returnsAllActive() {
        when(clubRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(activeClub));

        clubService.searchClubs("  ");

        verify(clubRepository).findByIsActiveTrueOrderByNameAsc();
        verify(clubRepository, never()).searchByName(any());
    }

    // ── getMyClubs ────────────────────────────────────────────────────────────

    @Test
    void getMyClubs_returnsDtosForUserClubs() {
        when(clubRepository.findByStaffUserId(OWNER_ID)).thenReturn(List.of(activeClub));

        List<ClubResponseDto> result = clubService.getMyClubs(OWNER_ID);

        assertThat(result).hasSize(1);
    }

    // ── createClub ────────────────────────────────────────────────────────────

    @Test
    void createClub_success_savesClubAndAssignsOwner() {
        when(clubRepository.existsBySlug(anyString())).thenReturn(false);
        when(clubRepository.save(any(Club.class))).thenReturn(activeClub);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(ownerUser));

        ClubRequestDto req = new ClubRequestDto(
                "FC Test", null, null, null, null, "Portland", "or", null);

        ClubResponseDto result = clubService.createClub(req, OWNER_ID);

        assertThat(result.name()).isEqualTo("FC Test");

        ArgumentCaptor<ClubStaff> staffCaptor = ArgumentCaptor.forClass(ClubStaff.class);
        verify(clubStaffRepository).save(staffCaptor.capture());
        assertThat(staffCaptor.getValue().getRole()).isEqualTo(ClubStaffRole.OWNER);
        assertThat(staffCaptor.getValue().getUser()).isEqualTo(ownerUser);
    }

    @Test
    void createClub_userNotFound_throwsIllegalArgumentException() {
        when(clubRepository.existsBySlug(anyString())).thenReturn(false);
        when(clubRepository.save(any(Club.class))).thenReturn(activeClub);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.empty());

        ClubRequestDto req = new ClubRequestDto(
                "FC Test", null, null, null, null, null, null, null);

        assertThatThrownBy(() -> clubService.createClub(req, OWNER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void createClub_stateUppercased() {
        when(clubRepository.existsBySlug(anyString())).thenReturn(false);
        when(clubRepository.save(any(Club.class))).thenReturn(activeClub);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(ownerUser));

        ClubRequestDto req = new ClubRequestDto(
                "FC Test", null, null, null, null, null, "or", null);

        clubService.createClub(req, OWNER_ID);

        ArgumentCaptor<Club> captor = ArgumentCaptor.forClass(Club.class);
        verify(clubRepository).save(captor.capture());
        assertThat(captor.getValue().getState()).isEqualTo("OR");
    }

    // ── updateClub ────────────────────────────────────────────────────────────

    @Test
    void updateClub_ownerCanUpdate() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(clubRepository.save(any(Club.class))).thenReturn(activeClub);

        ClubRequestDto req = new ClubRequestDto(
                "FC Test", null, "Updated desc", null, null, "Portland", "OR", null);

        ClubResponseDto result = clubService.updateClub("fc-test", req, OWNER_ID);

        assertThat(result).isNotNull();
        verify(clubRepository).save(activeClub);
    }

    @Test
    void updateClub_adminCanUpdate() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, ADMIN_ID, ClubStaffRole.OWNER)).thenReturn(false);
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, ADMIN_ID, ClubStaffRole.ADMIN)).thenReturn(true);
        when(clubRepository.save(any(Club.class))).thenReturn(activeClub);

        ClubRequestDto req = new ClubRequestDto(
                "FC Test", null, null, null, null, null, null, null);

        assertThatNoException().isThrownBy(() ->
                clubService.updateClub("fc-test", req, ADMIN_ID));
    }

    @Test
    void updateClub_nonAdminNonOwner_throwsSecurityException() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.OWNER)).thenReturn(false);
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.ADMIN)).thenReturn(false);

        ClubRequestDto req = new ClubRequestDto(
                "FC Test", null, null, null, null, null, null, null);

        assertThatThrownBy(() -> clubService.updateClub("fc-test", req, OTHER_ID))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("permission");
    }

    // ── deactivateClub ────────────────────────────────────────────────────────

    @Test
    void deactivateClub_ownerCanDeactivate() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);

        clubService.deactivateClub("fc-test", OWNER_ID);

        assertThat(activeClub.isActive()).isFalse();
        verify(clubRepository).save(activeClub);
    }

    @Test
    void deactivateClub_nonOwner_throwsSecurityException() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.OWNER)).thenReturn(false);

        assertThatThrownBy(() -> clubService.deactivateClub("fc-test", OTHER_ID))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void deactivateClub_clubNotFound_throwsIllegalArgumentException() {
        when(clubRepository.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clubService.deactivateClub("ghost", OWNER_ID))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── addStaff ──────────────────────────────────────────────────────────────

    @Test
    void addStaff_success_savesAndReturnsStaffDto() {
        User targetUser = User.builder().id(OTHER_ID).email("admin@onside.app").build();
        ClubStaff savedStaff = ClubStaff.builder()
                .id(UUID.randomUUID())
                .club(activeClub)
                .user(targetUser)
                .role(ClubStaffRole.ADMIN)
                .build();

        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("admin@onside.app"))
                .thenReturn(Optional.of(targetUser));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.ADMIN)).thenReturn(false);
        when(clubStaffRepository.save(any(ClubStaff.class))).thenReturn(savedStaff);

        AddStaffRequestDto req = new AddStaffRequestDto("admin@onside.app", ClubStaffRole.ADMIN);
        ClubStaffResponseDto result = clubService.addStaff("fc-test", req, OWNER_ID);

        assertThat(result.role()).isEqualTo(ClubStaffRole.ADMIN);
        assertThat(result.userEmail()).isEqualTo("admin@onside.app");
    }

    @Test
    void addStaff_ownerRoleCannotBeAssigned_throwsIllegalArgumentException() {
        User targetUser = User.builder().id(OTHER_ID).email("owner2@onside.app").build();

        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("owner2@onside.app"))
                .thenReturn(Optional.of(targetUser));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.OWNER)).thenReturn(false);

        AddStaffRequestDto req = new AddStaffRequestDto("owner2@onside.app", ClubStaffRole.OWNER);

        assertThatThrownBy(() -> clubService.addStaff("fc-test", req, OWNER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("OWNER role cannot be assigned manually");
    }

    @Test
    void addStaff_duplicateRole_throwsIllegalStateException() {
        User targetUser = User.builder().id(OTHER_ID).email("admin@onside.app").build();

        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("admin@onside.app"))
                .thenReturn(Optional.of(targetUser));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.ADMIN)).thenReturn(true);

        AddStaffRequestDto req = new AddStaffRequestDto("admin@onside.app", ClubStaffRole.ADMIN);

        assertThatThrownBy(() -> clubService.addStaff("fc-test", req, OWNER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already has role");
    }

    @Test
    void addStaff_targetUserNotFound_throwsIllegalArgumentException() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("ghost@onside.app"))
                .thenReturn(Optional.empty());

        AddStaffRequestDto req = new AddStaffRequestDto("ghost@onside.app", ClubStaffRole.ADMIN);

        assertThatThrownBy(() -> clubService.addStaff("fc-test", req, OWNER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No user found with email");
    }

    // ── removeStaff ───────────────────────────────────────────────────────────

    @Test
    void removeStaff_success_revokesRoles() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OTHER_ID, ClubStaffRole.OWNER)).thenReturn(false);

        clubService.removeStaff("fc-test", OTHER_ID, OWNER_ID);

        verify(clubStaffRepository).revokeAllForUserAtClub(
                eq(CLUB_ID), eq(OTHER_ID), any(OffsetDateTime.class));
    }

    @Test
    void removeStaff_cannotRemoveOwner_throwsIllegalStateException() {
        when(clubRepository.findBySlug("fc-test")).thenReturn(Optional.of(activeClub));
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);
        when(clubStaffRepository.existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
                CLUB_ID, OWNER_ID, ClubStaffRole.OWNER)).thenReturn(true);

        assertThatThrownBy(() -> clubService.removeStaff("fc-test", OWNER_ID, OWNER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot remove the club owner");
    }
}
