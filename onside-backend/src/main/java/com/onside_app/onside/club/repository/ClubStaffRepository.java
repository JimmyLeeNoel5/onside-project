package com.onside_app.onside.club.repository;

import com.onside_app.onside.club.entity.ClubStaff;
import com.onside_app.onside.common.enums.ClubStaffRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClubStaffRepository extends JpaRepository<ClubStaff, UUID> {

    List<ClubStaff> findByClubIdAndIsActiveTrueOrderByRoleAsc(UUID clubId);

    List<ClubStaff> findByUserIdAndIsActiveTrue(UUID userId);

    Optional<ClubStaff> findByClubIdAndUserIdAndRole(
            UUID clubId, UUID userId, ClubStaffRole role
    );

    boolean existsByClubIdAndUserIdAndRoleAndIsActiveTrue(
            UUID clubId, UUID userId, ClubStaffRole role
    );

    // ── Check if user has any active staff role at a club ─────────────────────

    boolean existsByClubIdAndUserIdAndIsActiveTrue(UUID clubId, UUID userId);

    // ── Revoke a specific role ─────────────────────────────────────────────────

    @Modifying
    @Query("""
        UPDATE ClubStaff s
        SET s.revokedAt = :now,
            s.isActive = false
        WHERE s.club.id = :clubId
        AND s.user.id = :userId
        AND s.role = :role
        AND s.isActive = true
        """)
    void revokeRole(
            @Param("clubId") UUID clubId,
            @Param("userId") UUID userId,
            @Param("role") ClubStaffRole role,
            @Param("now") OffsetDateTime now
    );

    // ── Revoke all roles for a user at a club ──────────────────────────────────

    @Modifying
    @Query("""
        UPDATE ClubStaff s
        SET s.revokedAt = :now,
            s.isActive = false
        WHERE s.club.id = :clubId
        AND s.user.id = :userId
        AND s.isActive = true
        """)
    void revokeAllForUserAtClub(
            @Param("clubId") UUID clubId,
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );
}