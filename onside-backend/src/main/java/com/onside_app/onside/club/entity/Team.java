package com.onside_app.onside.club.entity;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.SkillLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "teams")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "short_name", length = 50)
    private String shortName;

    @Column(nullable = false, length = 150)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_category", nullable = false,
            columnDefinition = "gender_category")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private GenderCategory genderCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false,
            columnDefinition = "skill_level")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private SkillLevel skillLevel;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor;


    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "is_recruiting", nullable = false)
    @Builder.Default
    private boolean isRecruiting = false;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "home_venue", length = 255)
    private String homeVenue;


    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<TeamRoster> roster = new ArrayList<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<SeasonTeam> seasonTeams = new ArrayList<>();
}