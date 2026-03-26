package com.onside_app.onside.event.service;

import com.onside_app.onside.club.repository.ClubRepository;
import com.onside_app.onside.common.enums.EventType;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.RegistrationStatus;
import com.onside_app.onside.common.util.SlugUtils;
import com.onside_app.onside.event.dto.*;
import com.onside_app.onside.event.entity.Event;
import com.onside_app.onside.event.entity.EventRegistration;
import com.onside_app.onside.event.repository.*;
import com.onside_app.onside.league.repository.LeagueRepository;
import com.onside_app.onside.league.repository.SeasonRepository;
import com.onside_app.onside.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository            eventRepo;
    private final EventRegistrationRepository regRepo;
    private final ClubRepository             clubRepo;
    private final UserRepository             userRepo;
    private final LeagueRepository           leagueRepo;
    private final SeasonRepository           seasonRepo;

    // ── Create event ──────────────────────────────────────────────────────────
    @Transactional
    public EventResponse create(EventRequest req, UUID hostUserId) {
        String slug = SlugUtils.toUniqueSlug(req.name(), eventRepo::existsBySlug);

        Event event = Event.builder()
                .name(req.name())
                .slug(slug)
                .type(req.type())
                .description(req.description())
                .genderCategory(req.genderCategory())
                .skillLevel(req.skillLevel())
                .hostUser(userRepo.getReferenceById(hostUserId))
                .hostClub(req.hostClubId() != null ? clubRepo.getReferenceById(req.hostClubId()) : null)
                .venueName(req.venueName())
                .addressLine1(req.addressLine1())
                .addressLine2(req.addressLine2())
                .city(req.city())
                .state(req.state())
                .zipCode(req.zipCode())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .startTime(req.startTime())
                .endTime(req.endTime())
                .registrationOpensAt(req.registrationOpensAt())
                .registrationClosesAt(req.registrationClosesAt())
                .capacity(req.capacity())
                .waitlistEnabled(req.waitlistEnabled())
                .waitlistCapacity(req.waitlistCapacity())
                .individualFee(req.individualFee())
                .teamFee(req.teamFee())
                .allowsIndividualReg(req.allowsIndividualReg())
                .allowsTeamReg(req.allowsTeamReg())
                .league(req.leagueId() != null ? leagueRepo.getReferenceById(req.leagueId()) : null)
                .season(req.seasonId() != null ? seasonRepo.getReferenceById(req.seasonId()) : null)
                .minAge(req.minAge())
                .maxAge(req.maxAge())
                .imageUrl(req.imageUrl())
                .website(req.website())
                .contactEmail(req.contactEmail())
                .contactPhone(req.contactPhone())
                .isPublished(req.isPublished())
                .build();

        return toResponse(eventRepo.save(event));
    }

    // ── Get all published ─────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventResponse> getPublished() {
        return eventRepo.findByIsPublishedTrueAndIsCancelledFalseOrderByStartDateAsc()
                .stream().map(this::toResponse).toList();
    }

    // ── Get by slug ───────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public EventResponse getBySlug(String slug) {
        return toResponse(eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug)));
    }

    // ── Get by id ─────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public EventResponse getById(UUID id) {
        return toResponse(eventRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id)));
    }

    // ── Search ────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventResponse> search(EventType type, String state,
                                      GenderCategory gender, LocalDate fromDate) {
        return eventRepo.search(type, state, gender, fromDate)
                .stream().map(this::toResponse).toList();
    }

    // ── Update ────────────────────────────────────────────────────────────────
    @Transactional
    public EventResponse update(String slug, EventRequest req) {
        Event event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug));

        event.setName(req.name());
        event.setType(req.type());
        event.setDescription(req.description());
        event.setGenderCategory(req.genderCategory());
        event.setSkillLevel(req.skillLevel());
        event.setVenueName(req.venueName());
        event.setAddressLine1(req.addressLine1());
        event.setAddressLine2(req.addressLine2());
        event.setCity(req.city());
        event.setState(req.state());
        event.setZipCode(req.zipCode());
        event.setStartDate(req.startDate());
        event.setEndDate(req.endDate());
        event.setStartTime(req.startTime());
        event.setEndTime(req.endTime());
        event.setRegistrationOpensAt(req.registrationOpensAt());
        event.setRegistrationClosesAt(req.registrationClosesAt());
        event.setCapacity(req.capacity());
        event.setWaitlistEnabled(req.waitlistEnabled());
        event.setWaitlistCapacity(req.waitlistCapacity());
        event.setIndividualFee(req.individualFee());
        event.setTeamFee(req.teamFee());
        event.setAllowsIndividualReg(req.allowsIndividualReg());
        event.setAllowsTeamReg(req.allowsTeamReg());
        event.setMinAge(req.minAge());
        event.setMaxAge(req.maxAge());
        event.setImageUrl(req.imageUrl());
        event.setWebsite(req.website());
        event.setContactEmail(req.contactEmail());
        event.setContactPhone(req.contactPhone());
        event.setPublished(req.isPublished());

        return toResponse(eventRepo.save(event));
    }

    // ── Publish / cancel ──────────────────────────────────────────────────────
    @Transactional
    public EventResponse publish(String slug) {
        Event event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug));
        event.setPublished(true);
        return toResponse(eventRepo.save(event));
    }

    @Transactional
    public EventResponse cancel(String slug, String reason) {
        Event event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug));
        event.setCancelled(true);
        event.setCancelledReason(reason);
        return toResponse(eventRepo.save(event));
    }

    // ── Soft delete ───────────────────────────────────────────────────────────
    @Transactional
    public void delete(String slug) {
        Event event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug));
        event.setDeletedAt(OffsetDateTime.now());
        eventRepo.save(event);
    }

    // ── Register individual ───────────────────────────────────────────────────
    @Transactional
    public EventRegistrationResponse register(String slug, UUID userId, EventRegistrationRequest req) {
        Event event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug));

        if (!event.isAllowsIndividualReg())
            throw new IllegalStateException("Event does not allow individual registration");
        if (event.isCancelled())
            throw new IllegalStateException("Event is cancelled");
        if (regRepo.existsByUser_IdAndEvent_Id(userId, event.getId()))
            throw new IllegalStateException("Already registered for this event");

        // Check capacity
        long confirmed = regRepo.countByEvent_IdAndStatus(event.getId(), RegistrationStatus.CONFIRMED);
        long waitlisted = regRepo.countByEvent_IdAndStatus(event.getId(), RegistrationStatus.WAITLISTED);

        RegistrationStatus status;
        Short waitlistPos = null;

        if (event.getCapacity() == null || confirmed < event.getCapacity()) {
            status = RegistrationStatus.CONFIRMED;
        } else if (event.isWaitlistEnabled() &&
                (event.getWaitlistCapacity() == null || waitlisted < event.getWaitlistCapacity())) {
            status = RegistrationStatus.WAITLISTED;
            waitlistPos = (short) (waitlisted + 1);
        } else {
            throw new IllegalStateException("Event is full");
        }

        EventRegistration reg = EventRegistration.builder()
                .user(userRepo.getReferenceById(userId))
                .event(event)
                .status(status)
                .waitlistPosition(waitlistPos)
                .playerNotes(req != null ? req.playerNotes() : null)
                .build();

        if (status == RegistrationStatus.CONFIRMED) {
            reg.setConfirmedAt(OffsetDateTime.now());
        }

        return toRegResponse(regRepo.save(reg));
    }

    // ── Cancel registration ───────────────────────────────────────────────────
    @Transactional
    public EventRegistrationResponse cancelRegistration(String slug, UUID userId) {
        Event event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug));

        EventRegistration reg = regRepo.findByUser_IdAndEvent_Id(userId, event.getId())
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

        if (reg.getStatus() == RegistrationStatus.CANCELLED)
            throw new IllegalStateException("Registration already cancelled");

        reg.setStatus(RegistrationStatus.CANCELLED);
        reg.setCancelledAt(OffsetDateTime.now());
        return toRegResponse(regRepo.save(reg));
    }

    // ── Get my registrations ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getMyRegistrations(UUID userId) {
        return regRepo.findByUser_IdOrderByRegisteredAtDesc(userId)
                .stream().map(this::toRegResponse).toList();
    }

    // ── Get event registrations ───────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getEventRegistrations(String slug) {
        Event event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + slug));
        return regRepo.findByEvent_IdOrderByRegisteredAtAsc(event.getId())
                .stream().map(this::toRegResponse).toList();
    }

    // ── Mappers ───────────────────────────────────────────────────────────────
    private EventResponse toResponse(Event e) {
        long confirmed  = regRepo.countByEvent_IdAndStatus(e.getId(), RegistrationStatus.CONFIRMED);
        long waitlisted = regRepo.countByEvent_IdAndStatus(e.getId(), RegistrationStatus.WAITLISTED);

        return new EventResponse(
                e.getId(), e.getName(), e.getSlug(), e.getType(),
                e.getDescription(), e.getGenderCategory(), e.getSkillLevel(),
                e.getVenueName(), e.getAddressLine1(), e.getAddressLine2(),
                e.getCity(), e.getState(), e.getZipCode(),
                e.getStartDate(), e.getEndDate(), e.getStartTime(), e.getEndTime(),
                e.getRegistrationOpensAt(), e.getRegistrationClosesAt(),
                e.getCapacity(), e.isWaitlistEnabled(), e.getWaitlistCapacity(),
                e.getIndividualFee(), e.getTeamFee(), e.getFeeCurrency(),
                e.isAllowsIndividualReg(), e.isAllowsTeamReg(),
                e.getMinAge(), e.getMaxAge(),
                e.getImageUrl(), e.getWebsite(), e.getContactEmail(), e.getContactPhone(),
                e.isPublished(), e.isCancelled(),
                e.getHostClub() != null ? e.getHostClub().getId() : null,
                e.getHostClub() != null ? e.getHostClub().getName() : null,
                e.getLeague() != null ? e.getLeague().getId() : null,
                e.getLeague() != null ? e.getLeague().getName() : null,
                e.getCreatedAt(), e.getUpdatedAt(),
                confirmed, waitlisted
        );
    }

    private EventRegistrationResponse toRegResponse(EventRegistration r) {
        return new EventRegistrationResponse(
                r.getId(),
                r.getEvent().getId(),
                r.getEvent().getName(),
                r.getEvent().getSlug(),
                r.getUser().getId(),
                r.getStatus(),
                r.getPaymentStatus(),
                r.getWaitlistPosition(),
                r.getPlayerNotes(),
                r.getRegisteredAt(),
                r.getConfirmedAt(),
                r.getCancelledAt()
        );
    }
}