package com.onside_app.onside.league.service;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import com.onside_app.onside.common.util.SlugUtils;
import com.onside_app.onside.league.dto.LeagueRequestDto;
import com.onside_app.onside.league.dto.LeagueResponseDto;
import com.onside_app.onside.league.entity.League;
import com.onside_app.onside.league.repository.LeagueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LeagueService {

    private final LeagueRepository leagueRepository;

    public LeagueService(LeagueRepository leagueRepository) {
        this.leagueRepository = leagueRepository;
    }

    // ── GET /leagues/mine ──────────────────────────────────────────────────────
    // Returns leagues the logged-in user is a member of by traversing:
    //   User → TeamRoster → Team → SeasonTeam → Season → League
    //
    // @Transactional(readOnly = true) keeps the Hibernate session open so
    // lazy relationships in the JPQL JOIN chain can be resolved.

    @Transactional(readOnly = true)
    public List<LeagueResponseDto> getMyLeagues(UUID userId) {
        return leagueRepository.findLeaguesByUserId(userId)
                .stream()
                .map(LeagueResponseDto::from)
                .toList();
    }

    // ── GET /leagues ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LeagueResponseDto> getAllLeagues(
            GenderCategory category,
            SkillLevel level,
            LeagueType leagueType) {

        boolean hasCategory = category != null;
        boolean hasLevel = level != null;
        boolean hasType = leagueType != null;

        List<League> leagues;

        if (hasType && hasCategory && hasLevel) {
            leagues = leagueRepository.findByLeagueTypeAndGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(leagueType, category, level);
        } else if (hasType && hasCategory) {
            leagues = leagueRepository.findByLeagueTypeAndGenderCategoryAndIsActiveTrueOrderByNameAsc(leagueType, category);
        } else if (hasType && hasLevel) {
            leagues = leagueRepository.findByLeagueTypeAndSkillLevelAndIsActiveTrueOrderByNameAsc(leagueType, level);
        } else if (hasCategory && hasLevel) {
            leagues = leagueRepository.findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(category, level);
        } else if (hasType) {
            leagues = leagueRepository.findByLeagueTypeAndIsActiveTrueOrderByNameAsc(leagueType);
        } else if (hasCategory) {
            leagues = leagueRepository.findByGenderCategoryAndIsActiveTrueOrderByNameAsc(category);
        } else if (hasLevel) {
            leagues = leagueRepository.findBySkillLevelAndIsActiveTrueOrderByNameAsc(level);
        } else {
            leagues = leagueRepository.findByIsActiveTrueOrderByNameAsc();
        }

        return leagues.stream().map(LeagueResponseDto::from).toList();
    }

    // ── GET /leagues/{slug} ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public LeagueResponseDto getLeagueBySlug(String slug) {
        League league = leagueRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("League not found: " + slug));
        return LeagueResponseDto.from(league);
    }

    // ── Search leagues ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LeagueResponseDto> searchLeagues(String query) {
        if (query == null || query.isBlank()) return getAllLeagues(null, null, null);
        return leagueRepository.searchByName(query.trim())
                .stream()
                .map(LeagueResponseDto::from)
                .toList();
    }

    // ── Create league ──────────────────────────────────────────────────────────

    @Transactional
    public LeagueResponseDto createLeague(LeagueRequestDto request) {
        String slug = SlugUtils.toUniqueSlug(request.name(), leagueRepository::existsBySlug);
        League league = League.builder()
                .name(request.name().strip())
                .shortName(request.shortName() != null ? request.shortName().strip() : null)
                .slug(slug)
                .genderCategory(request.genderCategory())
                .skillLevel(request.skillLevel())
                .leagueType(request.leagueType() != null ? request.leagueType() : LeagueType.RECREATIONAL)
                .description(request.description())
                .foundedYear(request.foundedYear())
                .website(request.website())
                .logoUrl(request.logoUrl())
                .build();
        return LeagueResponseDto.from(leagueRepository.save(league));
    }

    // ── Update league ──────────────────────────────────────────────────────────

    @Transactional
    public LeagueResponseDto updateLeague(String slug, LeagueRequestDto request) {
        League league = leagueRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("League not found: " + slug));
        if (!league.getName().equalsIgnoreCase(request.name().strip())) {
            String newSlug = SlugUtils.toUniqueSlug(request.name(),
                    s -> !s.equals(league.getSlug()) && leagueRepository.existsBySlug(s));
            league.setSlug(newSlug);
        }
        league.setName(request.name().strip());
        league.setShortName(request.shortName() != null ? request.shortName().strip() : null);
        league.setGenderCategory(request.genderCategory());
        league.setSkillLevel(request.skillLevel());
        if (request.leagueType() != null) league.setLeagueType(request.leagueType());
        league.setDescription(request.description());
        league.setFoundedYear(request.foundedYear());
        league.setWebsite(request.website());
        league.setLogoUrl(request.logoUrl());
        return LeagueResponseDto.from(leagueRepository.save(league));
    }

    // ── Deactivate league ──────────────────────────────────────────────────────

    @Transactional
    public void deactivateLeague(String slug) {
        League league = leagueRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("League not found: " + slug));
        league.setActive(false);
        leagueRepository.save(league);
    }
}