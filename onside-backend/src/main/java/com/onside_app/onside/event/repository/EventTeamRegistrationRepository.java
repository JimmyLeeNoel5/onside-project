package com.onside_app.onside.event.repository;

import com.onside_app.onside.event.entity.EventTeamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventTeamRegistrationRepository extends JpaRepository<EventTeamRegistration, UUID> {

    Optional<EventTeamRegistration> findByEvent_IdAndTeam_Id(UUID eventId, UUID teamId);

    boolean existsByEvent_IdAndTeam_Id(UUID eventId, UUID teamId);

    List<EventTeamRegistration> findByEvent_IdOrderByRegisteredAtAsc(UUID eventId);

    List<EventTeamRegistration> findByTeam_IdOrderByRegisteredAtDesc(UUID teamId);
}