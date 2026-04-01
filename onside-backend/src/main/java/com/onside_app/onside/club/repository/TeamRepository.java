package com.onside_app.onside.club.repository;

import com.onside_app.onside.club.entity.Team;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.SkillLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {

    // ── Basic lookups ──────────────────────────────────────────────────────────

    Optional<Team> findByClubIdAndSlug(UUID clubId, String slug);

    boolean existsByClubIdAndSlug(UUID clubId, String slug);

    List<Team> findByClubIdAndIsActiveTrueOrderByNameAsc(UUID clubId);

    // ── Category browsing filter ───────────────────────────────────────────────

    List<Team> findByGenderCategoryAndIsActiveTrueOrderByNameAsc(
            GenderCategory genderCategory
    );

    List<Team> findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
            GenderCategory genderCategory,
            SkillLevel skillLevel
    );

    // ── Recruiting filter ──────────────────────────────────────────────────────
    // Powers "teams looking for players" discovery feature

    List<Team> findByIsRecruitingTrueAndIsActiveTrueOrderByNameAsc();

    List<Team> findByGenderCategoryAndIsRecruitingTrueAndIsActiveTrueOrderByNameAsc(
            GenderCategory genderCategory
    );

    // ── State filter ───────────────────────────────────────────────────────────

    List<Team> findByStateAndIsActiveTrueOrderByNameAsc(String state);

    List<Team> findByGenderCategoryAndStateAndIsActiveTrueOrderByNameAsc(
            GenderCategory genderCategory, String state
    );

    // ── Search by name ─────────────────────────────────────────────────────────

    @Query("""
        SELECT t FROM Team t
        WHERE t.isActive = true
        AND LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY t.name ASC
        """)
    List<Team> searchByName(@Param("query") String query);

    @Query("""
        SELECT t FROM Team t
        WHERE t.isActive = true
        AND t.genderCategory = :genderCategory
        AND LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY t.name ASC
        """)
    List<Team> searchByNameAndCategory(
            @Param("query") String query,
            @Param("genderCategory") GenderCategory genderCategory
    );

    // ── With roster eager loaded ───────────────────────────────────────────────

    @Query("""
        SELECT DISTINCT t FROM Team t
        LEFT JOIN FETCH t.roster r
        WHERE t.club.id = :clubId
        AND t.slug = :slug
        AND r.leftAt IS NULL
        """)
    Optional<Team> findByClubIdAndSlugWithActiveRoster(
            @Param("clubId") UUID clubId,
            @Param("slug") String slug
    );

    // ── With club eager loaded ─────────────────────────────────────────────────

    @Query("""
        SELECT t FROM Team t
        JOIN FETCH t.club c
        WHERE t.id = :id
        """)
    Optional<Team> findByIdWithClub(@Param("id") UUID id);

    // ── Teams by league (via current/active season) ────────────────────────────

    @Query("""
        SELECT DISTINCT t FROM Team t
        JOIN t.seasonTeams st
        JOIN st.season s
        JOIN s.league l
        WHERE l.slug = :leagueSlug
        AND st.isActive = true
        AND (s.isCurrent = true OR s.isActive = true)
        ORDER BY t.name ASC
        """)
    List<Team> findByLeagueSlug(@Param("leagueSlug") String leagueSlug);
}
