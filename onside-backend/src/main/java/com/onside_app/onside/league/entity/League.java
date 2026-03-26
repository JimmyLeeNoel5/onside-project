package com.onside_app.onside.league.entity;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "leagues")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class League {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "short_name", length = 30)
    private String shortName;

    @Column(nullable = false, length = 150, unique = true)
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

    // NEW: league_type categorizes the league for browse page filtering.
    // Uses the same @JdbcTypeCode(SqlTypes.NAMED_ENUM) pattern as other enums.
    // columnDefinition must match the PostgreSQL type name from V3__league_type.sql.
    // Defaults to RECREATIONAL so existing leagues aren't broken.
    @Enumerated(EnumType.STRING)
    @Column(name = "league_type", nullable = false,
            columnDefinition = "league_type")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private LeagueType leagueType = LeagueType.RECREATIONAL;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "founded_year")
    private Short foundedYear;

    @Column(length = 255)
    private String website;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

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

    @OneToMany(mappedBy = "league", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<Conference> conferences = new ArrayList<>();

    @OneToMany(mappedBy = "league", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<Season> seasons = new ArrayList<>();
}