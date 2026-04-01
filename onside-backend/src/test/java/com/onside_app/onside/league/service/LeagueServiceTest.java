package com.onside_app.onside.league.service;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import com.onside_app.onside.league.dto.LeagueRequestDto;
import com.onside_app.onside.league.dto.LeagueResponseDto;
import com.onside_app.onside.league.entity.League;
import com.onside_app.onside.league.repository.LeagueRepository;
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
class LeagueServiceTest {

    @Mock LeagueRepository leagueRepository;

    @InjectMocks LeagueService leagueService;

    private static final UUID LEAGUE_ID = UUID.randomUUID();
    private static final UUID USER_ID   = UUID.randomUUID();

    private League testLeague;

    @BeforeEach
    void setUp() {
        testLeague = League.builder()
                .id(LEAGUE_ID)
                .name("Portland Rec League")
                .slug("portland-rec-league")
                .genderCategory(GenderCategory.MEN)
                .skillLevel(SkillLevel.RECREATIONAL)
                .leagueType(LeagueType.RECREATIONAL)
                .isActive(true)
                .build();
    }

    // ── getLeagueBySlug ───────────────────────────────────────────────────────

    @Test
    void getLeagueBySlug_found_returnsDto() {
        when(leagueRepository.findBySlug("portland-rec-league"))
                .thenReturn(Optional.of(testLeague));

        LeagueResponseDto dto = leagueService.getLeagueBySlug("portland-rec-league");

        assertThat(dto.slug()).isEqualTo("portland-rec-league");
        assertThat(dto.name()).isEqualTo("Portland Rec League");
        assertThat(dto.genderCategory()).isEqualTo(GenderCategory.MEN);
    }

    @Test
    void getLeagueBySlug_notFound_throwsIllegalArgumentException() {
        when(leagueRepository.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> leagueService.getLeagueBySlug("ghost"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("League not found");
    }

    // ── getMyLeagues ──────────────────────────────────────────────────────────

    @Test
    void getMyLeagues_returnsLeaguesForUser() {
        when(leagueRepository.findLeaguesByUserId(USER_ID)).thenReturn(List.of(testLeague));

        List<LeagueResponseDto> result = leagueService.getMyLeagues(USER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Portland Rec League");
        verify(leagueRepository).findLeaguesByUserId(USER_ID);
    }

    @Test
    void getMyLeagues_noLeagues_returnsEmptyList() {
        when(leagueRepository.findLeaguesByUserId(USER_ID)).thenReturn(List.of());

        List<LeagueResponseDto> result = leagueService.getMyLeagues(USER_ID);

        assertThat(result).isEmpty();
    }

    // ── getAllLeagues ─────────────────────────────────────────────────────────

    @Test
    void getAllLeagues_noFilters_returnsAll() {
        when(leagueRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(testLeague));

        List<LeagueResponseDto> result = leagueService.getAllLeagues(null, null, null);

        assertThat(result).hasSize(1);
        verify(leagueRepository).findByIsActiveTrueOrderByNameAsc();
    }

    @Test
    void getAllLeagues_typeOnly_usesTypeQuery() {
        when(leagueRepository.findByLeagueTypeAndIsActiveTrueOrderByNameAsc(LeagueType.RECREATIONAL))
                .thenReturn(List.of(testLeague));

        leagueService.getAllLeagues(null, null, LeagueType.RECREATIONAL);

        verify(leagueRepository).findByLeagueTypeAndIsActiveTrueOrderByNameAsc(LeagueType.RECREATIONAL);
    }

    @Test
    void getAllLeagues_categoryOnly_usesCategoryQuery() {
        when(leagueRepository.findByGenderCategoryAndIsActiveTrueOrderByNameAsc(GenderCategory.MEN))
                .thenReturn(List.of());

        leagueService.getAllLeagues(GenderCategory.MEN, null, null);

        verify(leagueRepository).findByGenderCategoryAndIsActiveTrueOrderByNameAsc(GenderCategory.MEN);
    }

    @Test
    void getAllLeagues_levelOnly_usesLevelQuery() {
        when(leagueRepository.findBySkillLevelAndIsActiveTrueOrderByNameAsc(SkillLevel.ELITE))
                .thenReturn(List.of());

        leagueService.getAllLeagues(null, SkillLevel.ELITE, null);

        verify(leagueRepository).findBySkillLevelAndIsActiveTrueOrderByNameAsc(SkillLevel.ELITE);
    }

    @Test
    void getAllLeagues_typeAndCategory_usesTypeCategoryQuery() {
        when(leagueRepository.findByLeagueTypeAndGenderCategoryAndIsActiveTrueOrderByNameAsc(
                LeagueType.AMATEUR, GenderCategory.WOMEN)).thenReturn(List.of());

        leagueService.getAllLeagues(GenderCategory.WOMEN, null, LeagueType.AMATEUR);

        verify(leagueRepository).findByLeagueTypeAndGenderCategoryAndIsActiveTrueOrderByNameAsc(
                LeagueType.AMATEUR, GenderCategory.WOMEN);
    }

    @Test
    void getAllLeagues_typeAndLevel_usesTypeLevelQuery() {
        when(leagueRepository.findByLeagueTypeAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                LeagueType.AMATEUR, SkillLevel.ELITE)).thenReturn(List.of());

        leagueService.getAllLeagues(null, SkillLevel.ELITE, LeagueType.AMATEUR);

        verify(leagueRepository).findByLeagueTypeAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                LeagueType.AMATEUR, SkillLevel.ELITE);
    }

    @Test
    void getAllLeagues_categoryAndLevel_usesCategoryLevelQuery() {
        when(leagueRepository.findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                GenderCategory.MEN, SkillLevel.INTERMEDIATE)).thenReturn(List.of());

        leagueService.getAllLeagues(GenderCategory.MEN, SkillLevel.INTERMEDIATE, null);

        verify(leagueRepository).findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                GenderCategory.MEN, SkillLevel.INTERMEDIATE);
    }

    @Test
    void getAllLeagues_allThreeFilters_usesFullQuery() {
        when(leagueRepository.findByLeagueTypeAndGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                LeagueType.AMATEUR, GenderCategory.MEN, SkillLevel.ELITE)).thenReturn(List.of());

        leagueService.getAllLeagues(GenderCategory.MEN, SkillLevel.ELITE, LeagueType.AMATEUR);

        verify(leagueRepository).findByLeagueTypeAndGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
                LeagueType.AMATEUR, GenderCategory.MEN, SkillLevel.ELITE);
    }

    // ── searchLeagues ─────────────────────────────────────────────────────────

    @Test
    void searchLeagues_withQuery_delegatesToSearchByName() {
        when(leagueRepository.searchByName("Portland")).thenReturn(List.of(testLeague));

        List<LeagueResponseDto> result = leagueService.searchLeagues("Portland");

        assertThat(result).hasSize(1);
        verify(leagueRepository).searchByName("Portland");
    }

    @Test
    void searchLeagues_blankQuery_fallsBackToGetAll() {
        when(leagueRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(testLeague));

        leagueService.searchLeagues("  ");

        verify(leagueRepository).findByIsActiveTrueOrderByNameAsc();
        verify(leagueRepository, never()).searchByName(any());
    }

    // ── createLeague ──────────────────────────────────────────────────────────

    @Test
    void createLeague_success_savesAndReturnsDto() {
        when(leagueRepository.existsBySlug(anyString())).thenReturn(false);
        when(leagueRepository.save(any(League.class))).thenReturn(testLeague);

        LeagueRequestDto req = new LeagueRequestDto(
                "Portland Rec League", null, GenderCategory.MEN,
                SkillLevel.RECREATIONAL, LeagueType.RECREATIONAL,
                null, null, null, null);

        LeagueResponseDto result = leagueService.createLeague(req);

        assertThat(result.name()).isEqualTo("Portland Rec League");
        verify(leagueRepository).save(any(League.class));
    }

    @Test
    void createLeague_nullLeagueType_defaultsToRecreational() {
        when(leagueRepository.existsBySlug(anyString())).thenReturn(false);
        when(leagueRepository.save(any(League.class))).thenAnswer(inv -> inv.getArgument(0));

        LeagueRequestDto req = new LeagueRequestDto(
                "My League", null, GenderCategory.MEN,
                SkillLevel.RECREATIONAL, null,
                null, null, null, null);

        leagueService.createLeague(req);

        ArgumentCaptor<League> captor = ArgumentCaptor.forClass(League.class);
        verify(leagueRepository).save(captor.capture());
        assertThat(captor.getValue().getLeagueType()).isEqualTo(LeagueType.RECREATIONAL);
    }

    @Test
    void createLeague_stripsWhitespaceFromName() {
        when(leagueRepository.existsBySlug(anyString())).thenReturn(false);
        when(leagueRepository.save(any(League.class))).thenAnswer(inv -> inv.getArgument(0));

        LeagueRequestDto req = new LeagueRequestDto(
                "  Portland Rec  ", null, GenderCategory.MEN,
                SkillLevel.RECREATIONAL, LeagueType.RECREATIONAL,
                null, null, null, null);

        leagueService.createLeague(req);

        ArgumentCaptor<League> captor = ArgumentCaptor.forClass(League.class);
        verify(leagueRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Portland Rec");
    }

    // ── updateLeague ──────────────────────────────────────────────────────────

    @Test
    void updateLeague_success_updatesFieldsAndSaves() {
        when(leagueRepository.findBySlug("portland-rec-league"))
                .thenReturn(Optional.of(testLeague));
        when(leagueRepository.save(any(League.class))).thenReturn(testLeague);

        LeagueRequestDto req = new LeagueRequestDto(
                "Portland Rec League", "PRL", GenderCategory.MEN,
                SkillLevel.ADVANCED, LeagueType.RECREATIONAL,
                "Updated description", null, "https://league.com", null);

        LeagueResponseDto result = leagueService.updateLeague("portland-rec-league", req);

        assertThat(result).isNotNull();
        verify(leagueRepository).save(testLeague);
        assertThat(testLeague.getSkillLevel()).isEqualTo(SkillLevel.ADVANCED);
    }

    @Test
    void updateLeague_notFound_throwsIllegalArgumentException() {
        when(leagueRepository.findBySlug("ghost")).thenReturn(Optional.empty());

        LeagueRequestDto req = new LeagueRequestDto(
                "Ghost League", null, GenderCategory.MEN,
                SkillLevel.RECREATIONAL, null,
                null, null, null, null);

        assertThatThrownBy(() -> leagueService.updateLeague("ghost", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("League not found");
    }

    // ── deactivateLeague ──────────────────────────────────────────────────────

    @Test
    void deactivateLeague_success_setsInactiveAndSaves() {
        when(leagueRepository.findBySlug("portland-rec-league"))
                .thenReturn(Optional.of(testLeague));

        leagueService.deactivateLeague("portland-rec-league");

        assertThat(testLeague.isActive()).isFalse();
        verify(leagueRepository).save(testLeague);
    }

    @Test
    void deactivateLeague_notFound_throwsIllegalArgumentException() {
        when(leagueRepository.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> leagueService.deactivateLeague("ghost"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
