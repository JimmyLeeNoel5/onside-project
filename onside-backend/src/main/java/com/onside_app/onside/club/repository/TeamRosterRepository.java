package com.onside_app.onside.club.repository;

import com.onside_app.onside.club.entity.TeamRoster;
import com.onside_app.onside.common.enums.TeamRosterRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRosterRepository extends JpaRepository<TeamRoster, UUID> {

    // ── Active roster ──────────────────────────────────────────────────────────
    // leftAt IS NULL = currently on the team

    List<TeamRoster> findByTeamIdAndLeftAtIsNullOrderByRoleAsc(UUID teamId);

    List<TeamRoster> findByTeamIdAndRoleAndLeftAtIsNull(
            UUID teamId, TeamRosterRole role
    );

    // ── User's current teams ───────────────────────────────────────────────────

    List<TeamRoster> findByUserIdAndLeftAtIsNull(UUID userId);

    // ── Specific membership lookup ─────────────────────────────────────────────

    Optional<TeamRoster> findByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
            UUID teamId, UUID userId, TeamRosterRole role
    );

    boolean existsByTeamIdAndUserIdAndRoleAndLeftAtIsNull(
            UUID teamId, UUID userId, TeamRosterRole role
    );

    // ── Check jersey number availability ──────────────────────────────────────

    boolean existsByTeamIdAndJerseyNumberAndLeftAtIsNull(
            UUID teamId, Short jerseyNumber
    );

    // ── Player leaves team ─────────────────────────────────────────────────────

    @Modifying
    @Query("""
        UPDATE TeamRoster r
        SET r.leftAt = :leftAt,
            r.isActive = false
        WHERE r.team.id = :teamId
        AND r.user.id = :userId
        AND r.role = :role
        AND r.leftAt IS NULL
        """)
    void leaveTeam(
            @Param("teamId") UUID teamId,
            @Param("userId") UUID userId,
            @Param("role") TeamRosterRole role,
            @Param("leftAt") LocalDate leftAt
    );

    // ── Full roster history for a team ────────────────────────────────────────

    @Query("""
        SELECT r FROM TeamRoster r
        JOIN FETCH r.user u
        LEFT JOIN FETCH u.profile p
        WHERE r.team.id = :teamId
        AND r.leftAt IS NULL
        ORDER BY r.role ASC, u.email ASC
        """)
    List<TeamRoster> findActiveRosterWithUserDetails(@Param("teamId") UUID teamId);
}