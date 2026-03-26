package com.onside_app.onside.auth.entity;

import com.onside_app.onside.users.entity.User;
import lombok.*;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_prt_user")
    )
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;                   // SHA-256 of the emailed token

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;           // 1 hour TTL recommended

    @Column(name = "used_at")
    private OffsetDateTime usedAt;              // NULL = not yet used; single-use

    // ── Helpers ────────────────────────────────────────────────────────────────

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(expiresAt);
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public boolean isValid() {
        return !isExpired() && !isUsed();
    }

    public void markUsed() {
        this.usedAt = OffsetDateTime.now();
    }
}
