package com.onside_app.onside.club.entity;

import com.onside_app.onside.common.enums.PlayerPosition;
import com.onside_app.onside.common.enums.TeamRosterRole;
import com.onside_app.onside.users.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_roster")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamRoster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "team_roster_role")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TeamRosterRole role;

    @Column(name = "jersey_number")
    private Short jerseyNumber;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private LocalDate joinedAt = LocalDate.now();

    @Column(name = "left_at")
    private LocalDate leftAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "player_position")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private PlayerPosition position;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // ── Helper methods ─────────────────────────────────────────────────────────

    public boolean isCurrentMember() {
        return leftAt == null;
    }

    public void leave() {
        this.leftAt = LocalDate.now();
        this.isActive = false;
    }
}