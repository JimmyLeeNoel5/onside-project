package com.onside_app.onside.league.repository;

import com.onside_app.onside.league.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeasonRepository extends JpaRepository<Season, UUID> {

    List<Season> findByLeagueIdAndIsActiveTrueOrderByYearDesc(UUID leagueId);

    Optional<Season> findByLeagueIdAndIsCurrent(UUID leagueId, boolean isCurrent);

    Optional<Season> findByLeagueIdAndName(UUID leagueId, String name);

    boolean existsByLeagueIdAndName(UUID leagueId, String name);

    // ── Get current season for a league ───────────────────────────────────────

    @Query("""
        SELECT s FROM Season s
        WHERE s.league.id = :leagueId
        AND s.isCurrent = true
        AND s.isActive = true
        """)
    Optional<Season> findCurrentByLeagueId(@Param("leagueId") UUID leagueId);

    // ── Enforce one current season per league ──────────────────────────────────
    // Called before setting a new season as current —
    // clears isCurrent on all other seasons for that league

    @Modifying
    @Query("""
        UPDATE Season s
        SET s.isCurrent = false
        WHERE s.league.id = :leagueId
        AND s.id != :excludeSeasonId
        """)
    void clearCurrentForLeague(
            @Param("leagueId") UUID leagueId,
            @Param("excludeSeasonId") UUID excludeSeasonId
    );

    // ── With season teams eager loaded ─────────────────────────────────────────

    @Query("""
        SELECT DISTINCT s FROM Season s
        LEFT JOIN FETCH s.seasonTeams st
        WHERE s.id = :id
        """)
    Optional<Season> findByIdWithSeasonTeams(@Param("id") UUID id);
}