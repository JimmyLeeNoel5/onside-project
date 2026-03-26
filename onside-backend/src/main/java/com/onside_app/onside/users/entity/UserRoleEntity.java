package com.onside_app.onside.users.entity;
import com.onside_app.onside.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "user_roles",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_user_role_per_context",
                columnNames = {"user_id", "role", "context_type", "context_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // ── Owning side ────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_roles_user")
    )
    private User user;

    // ── Role ───────────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "user_role")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private UserRole role;

    // ── Optional org scope ─────────────────────────────────────────────────────
    // NULL context = platform-wide role (e.g. SUPER_ADMIN)
    // Non-null context = scoped role (e.g. TEAM_MANAGER for a specific team)

    @Column(name = "context_type", length = 50)
    private String contextType;                 // 'league' | 'team' | 'tournament' | null

    @Column(name = "context_id")
    private UUID contextId;                     // UUID of the scoped entity

    // ── Grant audit ────────────────────────────────────────────────────────────

    @Column(name = "granted_by")
    private UUID grantedBy;                     // user id of admin who granted the role

    @Column(name = "granted_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime grantedAt = OffsetDateTime.now();

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;           // NULL = currently active

    // ── Helper ─────────────────────────────────────────────────────────────────

    public boolean isActive() {
        return revokedAt == null;
    }
}
