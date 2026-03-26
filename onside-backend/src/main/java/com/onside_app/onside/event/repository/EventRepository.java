package com.onside_app.onside.event.repository;

import com.onside_app.onside.common.enums.EventType;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    Optional<Event> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Event> findByIsPublishedTrueAndIsCancelledFalseOrderByStartDateAsc();

    List<Event> findByTypeAndIsPublishedTrueOrderByStartDateAsc(EventType type);

    List<Event> findByGenderCategoryAndIsPublishedTrueOrderByStartDateAsc(GenderCategory genderCategory);

    List<Event> findByCityAndStateAndIsPublishedTrueOrderByStartDateAsc(String city, String state);

    List<Event> findByStartDateBetweenAndIsPublishedTrueOrderByStartDateAsc(
            LocalDate from, LocalDate to);

    @Query("""
        SELECT e FROM Event e
        WHERE e.isPublished = true
        AND e.isCancelled = false
        AND (:type IS NULL OR e.type = :type)
        AND (:state IS NULL OR e.state = :state)
        AND (:genderCategory IS NULL OR e.genderCategory = :genderCategory)
        AND (:fromDate IS NULL OR e.startDate >= :fromDate)
        ORDER BY e.startDate ASC
    """)
    List<Event> search(
            @Param("type") EventType type,
            @Param("state") String state,
            @Param("genderCategory") GenderCategory genderCategory,
            @Param("fromDate") LocalDate fromDate
    );

    List<Event> findByHostClub_IdOrderByStartDateAsc(UUID clubId);

    List<Event> findByHostUser_IdOrderByStartDateAsc(UUID userId);
}