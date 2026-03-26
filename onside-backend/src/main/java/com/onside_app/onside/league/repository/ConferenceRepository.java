package com.onside_app.onside.league.repository;

import com.onside_app.onside.league.entity.Conference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConferenceRepository extends JpaRepository<Conference, UUID> {

    List<Conference> findByLeagueIdAndIsActiveTrueOrderByNameAsc(UUID leagueId);

    Optional<Conference> findByLeagueIdAndSlug(UUID leagueId, String slug);

    boolean existsByLeagueIdAndSlug(UUID leagueId, String slug);

    // ── With divisions eager loaded ────────────────────────────────────────────

    @Query("""
        SELECT DISTINCT c FROM Conference c
        LEFT JOIN FETCH c.divisions d
        WHERE c.league.id = :leagueId
        AND c.isActive = true
        ORDER BY c.name ASC
        """)
    List<Conference> findByLeagueIdWithDivisions(@Param("leagueId") UUID leagueId);
}