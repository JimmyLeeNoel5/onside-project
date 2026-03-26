package com.onside_app.onside.users.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "user_profile_levels",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_upl_profile_level",
                columnNames = {"user_profile_id", "level_name"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_profile_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_upl_profile")
    )
    private UserProfile userProfile;

    @Column(name = "level_name", nullable = false, length = 100)
    private String levelName;                   // e.g. 'Recreational', 'Collegiate D3'
    // FK to levels table will be added in league migration
}