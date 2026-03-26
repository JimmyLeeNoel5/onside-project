package com.onside_app.onside.league.repository;

import com.onside_app.onside.club.entity.SeasonTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeasonTeamRepository extends JpaRepository<SeasonTeam, UUID> {

    List<SeasonTeam> findBySeasonIdAndIsActiveTrueOrderByTeamNameAsc(UUID seasonId);

    List<SeasonTeam> findByTeamIdOrderBySeasonYearDesc(UUID teamId);

    Optional<SeasonTeam> findBySeasonIdAndTeamId(UUID seasonId, UUID teamId);

    boolean existsBySeasonIdAndTeamId(UUID seasonId, UUID teamId);

    // ── Find teams in a specific conference ────────────────────────────────────

    List<SeasonTeam> findBySeasonIdAndConferenceIdAndIsActiveTrue(
            UUID seasonId, UUID conferenceId
    );

    // ── Find teams in a specific division ─────────────────────────────────────

    List<SeasonTeam> findBySeasonIdAndDivisionIdAndIsActiveTrue(
            UUID seasonId, UUID divisionId
    );

    // ── Full details with all relationships loaded ─────────────────────────────
    // Used for league standings page — loads team, club, conference, division
    // in one query to avoid N+1

    @Query("""
        SELECT DISTINCT st FROM SeasonTeam st
        JOIN FETCH st.team t
        JOIN FETCH t.club c
        LEFT JOIN FETCH st.conference conf
        LEFT JOIN FETCH st.division div
        WHERE st.season.id = :seasonId
        AND st.isActive = true
        ORDER BY t.name ASC
        """)
    List<SeasonTeam> findBySeasonIdWithFullDetails(@Param("seasonId") UUID seasonId);

    // ── Find all seasons a team has participated in ────────────────────────────

    @Query("""
        SELECT st FROM SeasonTeam st
        JOIN FETCH st.season s
        JOIN FETCH s.league l
        WHERE st.team.id = :teamId
        ORDER BY s.year DESC
        """)
    List<SeasonTeam> findByTeamIdWithSeasonAndLeague(@Param("teamId") UUID teamId);
}