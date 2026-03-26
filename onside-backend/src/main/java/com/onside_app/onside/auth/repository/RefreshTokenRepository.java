package com.onside_app.onside.auth.repository;


import com.onside_app.onside.auth.entity.RefreshToken;
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
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    // ── Lookup by hashed token ─────────────────────────────────────────────────
    // Called during token refresh — client sends raw token, we hash it and look it up

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // ── Load all active tokens for a user ──────────────────────────────────────
    // Used to show active sessions on the user's security settings page

    List<RefreshToken> findByUserIdAndRevokedAtIsNull(UUID userId);

    // ── Count active sessions for a user ───────────────────────────────────────
    // Useful for enforcing a max sessions limit per user

    long countByUserIdAndRevokedAtIsNullAndExpiresAtAfter(
            UUID userId,
            OffsetDateTime now
    );

    // ── Revoke a specific token ────────────────────────────────────────────────
    // Called on logout from a specific device

    @Modifying
    @Query("""
        UPDATE RefreshToken t
        SET t.revokedAt = :now
        WHERE t.tokenHash = :tokenHash
        AND t.revokedAt IS NULL
        """)
    void revokeByTokenHash(
            @Param("tokenHash") String tokenHash,
            @Param("now") OffsetDateTime now
    );

    // ── Revoke all tokens for a user ───────────────────────────────────────────
    // Called on logout from all devices, or when account is soft-deleted

    @Modifying
    @Query("""
        UPDATE RefreshToken t
        SET t.revokedAt = :now
        WHERE t.user.id = :userId
        AND t.revokedAt IS NULL
        """)
    void revokeAllByUserId(
            @Param("userId") UUID userId,
            @Param("now") OffsetDateTime now
    );

    // ── Clean up expired tokens ────────────────────────────────────────────────
    // Run periodically via a scheduled job to keep the table lean

    @Modifying
    @Query("""
        DELETE FROM RefreshToken t
        WHERE t.expiresAt < :cutoff
        OR t.revokedAt < :cutoff
        """)
    void deleteExpiredAndRevokedBefore(@Param("cutoff") OffsetDateTime cutoff);

    // ── Check if a token exists and is valid ───────────────────────────────────

    @Query("""
        SELECT COUNT(t) > 0 FROM RefreshToken t
        WHERE t.tokenHash = :tokenHash
        AND t.revokedAt IS NULL
        AND t.expiresAt > :now
        """)
    boolean existsValidToken(
            @Param("tokenHash") String tokenHash,
            @Param("now") OffsetDateTime now
    );
}