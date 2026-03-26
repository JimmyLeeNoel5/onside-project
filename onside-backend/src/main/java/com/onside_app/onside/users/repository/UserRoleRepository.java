package com.onside_app.onside.users.repository;


import com.onside_app.onside.common.enums.UserRole;
import com.onside_app.onside.users.entity.UserRoleEntity;
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
public interface UserRoleRepository extends JpaRepository<UserRoleEntity, UUID> {

    // ── Load all active roles for a user ───────────────────────────────────────
    // Called by Spring Security on every authenticated request

    List<UserRoleEntity> findByUserIdAndRevokedAtIsNull(UUID userId);

    // ── Check if a user has a specific platform-wide role ─────────────────────
    // e.g. is this user a SUPER_ADMIN?

    boolean existsByUserIdAndRoleAndRevokedAtIsNull(UUID userId, UserRole role);

    // ── Check if a user has a role scoped to a specific org ───────────────────
    // e.g. is this user a TEAM_MANAGER for team X?

    boolean existsByUserIdAndRoleAndContextTypeAndContextIdAndRevokedAtIsNull(
            UUID userId,
            UserRole role,
            String contextType,
            UUID contextId
    );

    // ── Find a specific active role assignment ─────────────────────────────────

    @Query("""
        SELECT r FROM UserRoleEntity r
        WHERE r.user.id = :userId
        AND r.role = :role
        AND r.contextType = :contextType
        AND r.contextId = :contextId
        AND r.revokedAt IS NULL
        """)
    Optional<UserRoleEntity> findActiveRole(
            @Param("userId") UUID userId,
            @Param("role") UserRole role,
            @Param("contextType") String contextType,
            @Param("contextId") UUID contextId
    );

    // ── Find a specific active platform-wide role ──────────────────────────────

    @Query("""
        SELECT r FROM UserRoleEntity r
        WHERE r.user.id = :userId
        AND r.role = :role
        AND r.contextType IS NULL
        AND r.contextId IS NULL
        AND r.revokedAt IS NULL
        """)
    Optional<UserRoleEntity> findActivePlatformRole(
            @Param("userId") UUID userId,
            @Param("role") UserRole role
    );

    // ── Revoke a specific role ─────────────────────────────────────────────────

    @Modifying
    @Query("""
        UPDATE UserRoleEntity r
        SET r.revokedAt = :now
        WHERE r.user.id = :userId
        AND r.role = :role
        AND r.revokedAt IS NULL
        """)
    void revokeRole(
            @Param("userId") UUID userId,
            @Param("role") UserRole role,
            @Param("now") OffsetDateTime now
    );

    // ── Revoke all roles for a user ────────────────────────────────────────────
    // Used when soft-deleting an account

    @Modifying
    @Query("""
        UPDATE UserRoleEntity r
        SET r.revokedAt = :now
        WHERE r.user.id = :userId
        AND r.revokedAt IS NULL
        """)
    void revokeAllRolesForUser(
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );
}