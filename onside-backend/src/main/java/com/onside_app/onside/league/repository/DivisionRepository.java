package com.onside_app.onside.league.repository;

import com.onside_app.onside.league.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DivisionRepository extends JpaRepository<Division, UUID> {

    List<Division> findByConferenceIdAndIsActiveTrueOrderByNameAsc(UUID conferenceId);

    Optional<Division> findByConferenceIdAndSlug(UUID conferenceId, String slug);

    boolean existsByConferenceIdAndSlug(UUID conferenceId, String slug);
}
