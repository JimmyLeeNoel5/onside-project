package com.onside_app.onside.users.entity;

import com.onside_app.onside.common.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // ── Owning side of the 1:1 relationship ───────────────────────────────────

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_user_profiles_user")
    )
    private User user;

    // ── Personal identity ──────────────────────────────────────────────────────
    // first_name and last_name live here, NOT in the users table

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "phone", length = 20)
    private String phone;

    // ── Display ────────────────────────────────────────────────────────────────

    @Column(name = "avatar_url")
    private String avatarUrl;                   // S3 object key

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    // ── Soccer identity ────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_position", columnDefinition = "player_position")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private PlayerPosition primaryPosition;

    // secondaryPosition
    @Enumerated(EnumType.STRING)
    @Column(name = "secondary_position", columnDefinition = "player_position")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private PlayerPosition secondaryPosition;

    // skillLevel
    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", columnDefinition = "skill_level")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private SkillLevel skillLevel;

    // dominantFoot
    @Enumerated(EnumType.STRING)
    @Column(name = "dominant_foot", columnDefinition = "dominant_foot")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private DominantFoot dominantFoot;

    // preferredGenderCat
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_gender_cat", columnDefinition = "gender_category")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private GenderCategory preferredGenderCat;

    @Column(name = "jersey_number")
    private Short jerseyNumber;

    // ── Location ───────────────────────────────────────────────────────────────

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 2)
    private String state;

    @Column(name = "zip_code", length = 10)
    private String zipCode;
    // coordinates (PostGIS) will be added when we integrate spatial queries

    // ── Social links ───────────────────────────────────────────────────────────

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "twitter_url")
    private String twitterUrl;

    @Column(name = "tiktok_url")
    private String tiktokUrl;

    @Column(name = "youtube_url")
    private String youtubeUrl;

    @Column(name = "personal_website_url")
    private String personalWebsiteUrl;

    // ── Preferences ────────────────────────────────────────────────────────────

    @Column(name = "receive_email_alerts", nullable = false)
    @Builder.Default
    private boolean receiveEmailAlerts = true;

    @Column(name = "receive_sms_alerts", nullable = false)
    @Builder.Default
    private boolean receiveSmsAlerts = false;

    @Column(name = "profile_is_public", nullable = false)
    @Builder.Default
    private boolean profileIsPublic = true;

    // ── Audit ──────────────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    // ── Relationships ──────────────────────────────────────────────────────────

    @OneToMany(
            mappedBy = "userProfile",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<UserProfileLevel> levels = new LinkedHashSet<>();

    // ── Lifecycle hooks ────────────────────────────────────────────────────────

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // ── Convenience helpers ────────────────────────────────────────────────────

    public String getFullName() {
        return firstName + " " + lastName;
    }
}