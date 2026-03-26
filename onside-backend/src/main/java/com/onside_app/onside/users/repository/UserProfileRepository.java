package com.onside_app.onside.users.repository;

import com.onside_app.onside.users.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    // ── Lookup ─────────────────────────────────────────────────────────────────

    Optional<UserProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    // ── Name search ────────────────────────────────────────────────────────────

    @Query("""
        SELECT p FROM UserProfile p
        WHERE lower(p.firstName) LIKE lower(concat('%', :name, '%'))
        OR lower(p.lastName) LIKE lower(concat('%', :name, '%'))
        OR lower(concat(p.firstName, ' ', p.lastName)) LIKE lower(concat('%', :name, '%'))
        """)
    java.util.List<UserProfile> searchByName(@Param("name") String name);

    // ── Fetch with user eagerly (avoids N+1 on auth flows) ────────────────────

    @Query("""
        SELECT p FROM UserProfile p
        JOIN FETCH p.user u
        WHERE u.id = :userId
        """)
    Optional<UserProfile> findByUserIdWithUser(@Param("userId") UUID userId);

    // ── Partial update — avatar ────────────────────────────────────────────────

    @Modifying
    @Query("""
        UPDATE UserProfile p
        SET p.avatarUrl = :avatarUrl
        WHERE p.user.id = :userId
        """)
    void updateAvatarUrl(@Param("userId") UUID userId, @Param("avatarUrl") String avatarUrl);
}