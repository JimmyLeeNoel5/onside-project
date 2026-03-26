package com.onside_app.onside.event.repository;

import com.onside_app.onside.common.enums.RegistrationStatus;
import com.onside_app.onside.event.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {

    Optional<EventRegistration> findByUser_IdAndEvent_Id(UUID userId, UUID eventId);

    boolean existsByUser_IdAndEvent_Id(UUID userId, UUID eventId);

    List<EventRegistration> findByUser_IdOrderByRegisteredAtDesc(UUID userId);

    List<EventRegistration> findByEvent_IdOrderByRegisteredAtAsc(UUID eventId);

    List<EventRegistration> findByEvent_IdAndStatusOrderByRegisteredAtAsc(
            UUID eventId, RegistrationStatus status);

    long countByEvent_IdAndStatus(UUID eventId, RegistrationStatus status);

    long countByEvent_IdAndStatusNot(UUID eventId, RegistrationStatus status);
}