package com.onside_app.onside.event.entity;

import com.onside_app.onside.club.entity.Club;
import com.onside_app.onside.common.enums.*;
import com.onside_app.onside.league.entity.League;
import com.onside_app.onside.league.entity.Season;
import com.onside_app.onside.users.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "events", schema = "onside_app_dev")
@SQLRestriction("deleted_at IS NULL")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "event_type")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private EventType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_category", columnDefinition = "gender_category")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private GenderCategory genderCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", columnDefinition = "skill_level")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private SkillLevel skillLevel;

    // ── Host ──────────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_club_id")
    private Club hostClub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_user_id")
    private User hostUser;

    // ── Location ──────────────────────────────────────────────────────────────
    @Column(name = "venue_name", length = 255)
    private String venueName;

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    // ── Schedule ──────────────────────────────────────────────────────────────
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    // ── Registration window ───────────────────────────────────────────────────
    @Column(name = "registration_opens_at")
    private OffsetDateTime registrationOpensAt;

    @Column(name = "registration_closes_at")
    private OffsetDateTime registrationClosesAt;

    // ── Capacity ──────────────────────────────────────────────────────────────
    @Column
    private Short capacity;

    @Column(name = "waitlist_enabled", nullable = false)
    private boolean waitlistEnabled = false;

    @Column(name = "waitlist_capacity")
    private Short waitlistCapacity;

    // ── Fees ──────────────────────────────────────────────────────────────────
    @Column(name = "individual_fee", precision = 10, scale = 2)
    private BigDecimal individualFee;

    @Column(name = "team_fee", precision = 10, scale = 2)
    private BigDecimal teamFee;

    @Column(name = "fee_currency", length = 3, nullable = false)
    private String feeCurrency = "USD";

    // ── Registration type ─────────────────────────────────────────────────────
    @Column(name = "allows_individual_reg", nullable = false)
    private boolean allowsIndividualReg = true;

    @Column(name = "allows_team_reg", nullable = false)
    private boolean allowsTeamReg = false;

    // ── League / Season link ──────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_id")
    private League league;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id")
    private Season season;

    // ── Age restrictions ──────────────────────────────────────────────────────
    @Column(name = "min_age")
    private Short minAge;

    @Column(name = "max_age")
    private Short maxAge;

    // ── Meta ──────────────────────────────────────────────────────────────────
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 255)
    private String website;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;

    @Column(name = "is_cancelled", nullable = false)
    private boolean isCancelled = false;

    @Column(name = "cancelled_reason", columnDefinition = "TEXT")
    private String cancelledReason;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}