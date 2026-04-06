package com.onside_app.onside.league.repository;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import com.onside_app.onside.league.entity.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeagueRepository extends JpaRepository<League, UUID> {

    // ── Lookup ─────────────────────────────────────────────────────────────────

    Optional<League> findBySlug(String slug);

    boolean existsBySlug(String slug);

    // ── GET /leagues/mine ──────────────────────────────────────────────────────
    // Traverses the full relationship chain to find leagues the user belongs to:
    //   User → TeamRoster → Team → SeasonTeam → Season → League
    //
    // Conditions:
    //   - tr.user.id = :userId     the roster entry belongs to this user
    //   - tr.isActive = true       they're still an active roster member
    //   - tr.leftAt IS NULL        they haven't left the team
    //   - st.isActive = true       the season-team entry is active
    //   - l.isActive = true        the league itself is active
    //
    // DISTINCT prevents the same league appearing multiple times if the user
    // is on multiple teams in the same league.

    @Query("""
        SELECT DISTINCT l FROM League l
        JOIN l.seasons s
        JOIN s.seasonTeams st
        JOIN st.team t
        JOIN t.roster tr
        WHERE tr.user.id = :userId
          AND tr.isActive = true
          AND tr.leftAt IS NULL
          AND st.isActive = true
          AND l.isActive = true
        ORDER BY l.name ASC
        """)
    List<League> findLeaguesByUserId(@Param("userId") UUID userId);

    // ── Filtered browse queries ────────────────────────────────────────────────
    // Separate methods per filter combination to avoid PostgreSQL null enum
    // type inference issues with (:param IS NULL OR col = :param) patterns.

    List<League> findByIsActiveTrueOrderByNameAsc();

    List<League> findByLeagueTypeAndIsActiveTrueOrderByNameAsc(LeagueType leagueType);

    List<League> findByGenderCategoryAndIsActiveTrueOrderByNameAsc(GenderCategory genderCategory);

    List<League> findBySkillLevelAndIsActiveTrueOrderByNameAsc(SkillLevel skillLevel);

    List<League> findByLeagueTypeAndGenderCategoryAndIsActiveTrueOrderByNameAsc(
            LeagueType leagueType, GenderCategory genderCategory);

    List<League> findByLeagueTypeAndSkillLevelAndIsActiveTrueOrderByNameAsc(
            LeagueType leagueType, SkillLevel skillLevel);

    List<League> findByGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
            GenderCategory genderCategory, SkillLevel skillLevel);

    List<League> findByLeagueTypeAndGenderCategoryAndSkillLevelAndIsActiveTrueOrderByNameAsc(
            LeagueType leagueType, GenderCategory genderCategory, SkillLevel skillLevel);

    // ── Stats ──────────────────────────────────────────────────────────────────

    long countByIsActiveTrue();

    // ── Search ─────────────────────────────────────────────────────────────────

    @Query("""
        SELECT l FROM League l
        WHERE l.isActive = true
          AND LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY l.name ASC
        """)
    List<League> searchByName(@Param("query") String query);
}