package com.onside_app.onside.users.repository;

import com.onside_app.onside.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // ── Lookup ─────────────────────────────────────────────────────────────────

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    // ── Soft delete override ───────────────────────────────────────────────────

    @Modifying
    @Query("UPDATE User u SET u.deletedAt = :now, u.isActive = false WHERE u.id = :id")
    void softDeleteById(@Param("id") UUID id, @Param("now") OffsetDateTime now);

    // ── Login tracking ─────────────────────────────────────────────────────────

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :now WHERE u.id = :id")
    void updateLastLoginAt(@Param("id") UUID id, @Param("now") OffsetDateTime now);

    // ── Email verification ─────────────────────────────────────────────────────

    @Modifying
    @Query("""
        UPDATE User u
        SET u.isEmailVerified = true, u.emailVerifiedAt = :now
        WHERE u.id = :id
        """)
    void markEmailVerified(@Param("id") UUID id, @Param("now") OffsetDateTime now);
}