package com.onside_app.onside.auth.repository;


import com.onside_app.onside.auth.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    // ── Lookup by hashed token ─────────────────────────────────────────────────
    // User clicks the verification link — we hash the token and look it up

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    // ── Check if user already has a valid token ────────────────────────────────
    // Prevents resend spam

    @Query("""
        SELECT COUNT(t) > 0 FROM EmailVerificationToken t
        WHERE t.user.id = :userId
        AND t.usedAt IS NULL
        AND t.expiresAt > :now
        """)
    boolean hasValidTokenForUser(
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );

    // ── Find the latest active token for a user ────────────────────────────────
    // Used on the resend verification email flow

    @Query("""
        SELECT t FROM EmailVerificationToken t
        WHERE t.user.id = :userId
        AND t.usedAt IS NULL
        AND t.expiresAt > :now
        ORDER BY t.expiresAt DESC
        """)
    Optional<EmailVerificationToken> findLatestValidForUser(
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );

    // ── Invalidate all existing tokens for a user ──────────────────────────────
    // Called before issuing a new token on resend

    @Modifying
    @Query("""
        UPDATE EmailVerificationToken t
        SET t.usedAt = :now
        WHERE t.user.id = :userId
        AND t.usedAt IS NULL
        """)
    void invalidateAllForUser(
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );

    // ── Cleanup expired and used tokens ───────────────────────────────────────

    @Modifying
    @Query("""
        DELETE FROM EmailVerificationToken t
        WHERE t.expiresAt < :cutoff
        OR t.usedAt < :cutoff
        """)
    void deleteExpiredAndUsedBefore(@Param("cutoff") OffsetDateTime cutoff);
}