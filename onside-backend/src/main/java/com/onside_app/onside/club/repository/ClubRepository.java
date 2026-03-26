package com.onside_app.onside.club.repository;

import com.onside_app.onside.club.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClubRepository extends JpaRepository<Club, UUID> {

    // ── Basic lookups ──────────────────────────────────────────────────────────

    Optional<Club> findBySlug(String slug);

    boolean existsBySlug(String slug);

    // ── Browse and filter ──────────────────────────────────────────────────────

    List<Club> findByIsActiveTrueOrderByNameAsc();

    List<Club> findByStateAndIsActiveTrueOrderByNameAsc(String state);

    List<Club> findByIsVerifiedTrueAndIsActiveTrueOrderByNameAsc();

    // ── Search by name ─────────────────────────────────────────────────────────

    @Query("""
        SELECT c FROM Club c
        WHERE c.isActive = true
        AND LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY c.name ASC
        """)
    List<Club> searchByName(@Param("query") String query);

    // ── With teams eager loaded ────────────────────────────────────────────────

    @Query("""
        SELECT DISTINCT c FROM Club c
        LEFT JOIN FETCH c.teams t
        WHERE c.slug = :slug
        AND t.isActive = true
        """)
    Optional<Club> findBySlugWithTeams(@Param("slug") String slug);

    // ── With staff eager loaded ────────────────────────────────────────────────

    @Query("""
        SELECT DISTINCT c FROM Club c
        LEFT JOIN FETCH c.staff s
        WHERE c.id = :id
        AND s.isActive = true
        """)
    Optional<Club> findByIdWithStaff(@Param("id") UUID id);

    // ── Find clubs managed by a user ───────────────────────────────────────────

    @Query("""
        SELECT c FROM Club c
        JOIN c.staff s
        WHERE s.user.id = :userId
        AND s.isActive = true
        AND c.isActive = true
        ORDER BY c.name ASC
        """)
    List<Club> findByStaffUserId(@Param("userId") UUID userId);
}