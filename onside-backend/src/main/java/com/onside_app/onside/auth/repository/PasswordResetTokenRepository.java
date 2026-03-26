package com.onside_app.onside.auth.repository;


import com.onside_app.onside.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    // ── Lookup by hashed token ─────────────────────────────────────────────────
    // User clicks the reset link in their email — we hash the token and look it up

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    // ── Check if a valid token already exists for a user ──────────────────────
    // Prevents spamming the forgot password endpoint

    @Query("""
        SELECT COUNT(t) > 0 FROM PasswordResetToken t
        WHERE t.user.id = :userId
        AND t.usedAt IS NULL
        AND t.expiresAt > :now
        """)
    boolean hasValidTokenForUser(
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );

    // ── Invalidate all existing tokens for a user ──────────────────────────────
    // Called before issuing a new token so only one is ever active at a time

    @Modifying
    @Query("""
        UPDATE PasswordResetToken t
        SET t.usedAt = :now
        WHERE t.user.id = :userId
        AND t.usedAt IS NULL
        """)
    void invalidateAllForUser(
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );

    // ── Cleanup expired and used tokens ───────────────────────────────────────
    // Run periodically to keep the table lean

    @Modifying
    @Query("""
        DELETE FROM PasswordResetToken t
        WHERE t.expiresAt < :cutoff
        OR t.usedAt < :cutoff
        """)
    void deleteExpiredAndUsedBefore(@Param("cutoff") OffsetDateTime cutoff);
}