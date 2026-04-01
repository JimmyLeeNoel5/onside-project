package com.onside_app.onside.event.service;

import com.onside_app.onside.club.repository.ClubRepository;
import com.onside_app.onside.common.enums.*;
import com.onside_app.onside.event.dto.*;
import com.onside_app.onside.event.entity.Event;
import com.onside_app.onside.event.entity.EventRegistration;
import com.onside_app.onside.event.repository.EventRegistrationRepository;
import com.onside_app.onside.event.repository.EventRepository;
import com.onside_app.onside.league.repository.LeagueRepository;
import com.onside_app.onside.league.repository.SeasonRepository;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock EventRepository            eventRepo;
    @Mock EventRegistrationRepository regRepo;
    @Mock ClubRepository             clubRepo;
    @Mock UserRepository             userRepo;
    @Mock LeagueRepository           leagueRepo;
    @Mock SeasonRepository           seasonRepo;

    @InjectMocks EventService eventService;

    private static final UUID EVENT_ID = UUID.randomUUID();
    private static final UUID USER_ID  = UUID.randomUUID();
    private static final UUID HOST_ID  = UUID.randomUUID();

    private Event publishedEvent;
    private User  hostUser;

    @BeforeEach
    void setUp() {
        hostUser = User.builder().id(HOST_ID).email("host@onside.app").build();

        publishedEvent = Event.builder()
                .id(EVENT_ID)
                .name("Summer Tryout")
                .slug("summer-tryout")
                .type(EventType.TRYOUT)
                .isPublished(true)
                .isCancelled(false)
                .allowsIndividualReg(true)
                .capacity((short) 20)
                .waitlistEnabled(false)
                .hostUser(hostUser)
                .startDate(LocalDate.now().plusDays(30))
                .build();

        // Default count stubs — most tests go through toResponse()
        lenient().when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.CONFIRMED))
                .thenReturn(0L);
        lenient().when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.WAITLISTED))
                .thenReturn(0L);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private EventRequest minimalRequest() {
        return new EventRequest(
                "Summer Tryout",           // name
                EventType.TRYOUT,          // type
                null,                      // description
                null,                      // genderCategory
                null,                      // skillLevel
                null,                      // hostClubId
                null,                      // venueName
                null,                      // addressLine1
                null,                      // addressLine2
                null,                      // city
                null,                      // state
                null,                      // zipCode
                LocalDate.now().plusDays(30), // startDate
                null,                      // endDate
                null,                      // startTime
                null,                      // endTime
                null,                      // registrationOpensAt
                null,                      // registrationClosesAt
                (short) 20,                // capacity
                false,                     // waitlistEnabled
                null,                      // waitlistCapacity
                null,                      // individualFee
                null,                      // teamFee
                true,                      // allowsIndividualReg
                false,                     // allowsTeamReg
                null,                      // leagueId
                null,                      // seasonId
                null,                      // minAge
                null,                      // maxAge
                null,                      // imageUrl
                null,                      // website
                null,                      // contactEmail
                null,                      // contactPhone
                true                       // isPublished
        );
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_success_savesEventAndReturnsResponse() {
        when(eventRepo.existsBySlug(anyString())).thenReturn(false);
        when(userRepo.getReferenceById(HOST_ID)).thenReturn(hostUser);
        when(eventRepo.save(any(Event.class))).thenReturn(publishedEvent);

        EventResponse result = eventService.create(minimalRequest(), HOST_ID);

        assertThat(result.name()).isEqualTo("Summer Tryout");
        assertThat(result.slug()).isEqualTo("summer-tryout");
        assertThat(result.type()).isEqualTo(EventType.TRYOUT);
        verify(eventRepo).save(any(Event.class));
    }

    @Test
    void create_slugGeneratedFromName() {
        when(eventRepo.existsBySlug(anyString())).thenReturn(false);
        when(userRepo.getReferenceById(HOST_ID)).thenReturn(hostUser);
        when(eventRepo.save(any(Event.class))).thenReturn(publishedEvent);

        eventService.create(minimalRequest(), HOST_ID);

        verify(eventRepo, atLeastOnce()).existsBySlug(anyString());
    }

    // ── getPublished ──────────────────────────────────────────────────────────

    @Test
    void getPublished_returnsOnlyPublishedAndNonCancelled() {
        when(eventRepo.findByIsPublishedTrueAndIsCancelledFalseOrderByStartDateAsc())
                .thenReturn(List.of(publishedEvent));

        List<EventResponse> result = eventService.getPublished();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).slug()).isEqualTo("summer-tryout");
    }

    @Test
    void getPublished_empty_returnsEmptyList() {
        when(eventRepo.findByIsPublishedTrueAndIsCancelledFalseOrderByStartDateAsc())
                .thenReturn(List.of());

        List<EventResponse> result = eventService.getPublished();

        assertThat(result).isEmpty();
    }

    // ── getBySlug ─────────────────────────────────────────────────────────────

    @Test
    void getBySlug_found_returnsResponse() {
        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));

        EventResponse result = eventService.getBySlug("summer-tryout");

        assertThat(result.slug()).isEqualTo("summer-tryout");
    }

    @Test
    void getBySlug_notFound_throwsIllegalArgumentException() {
        when(eventRepo.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.getBySlug("ghost"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Event not found");
    }

    // ── search ────────────────────────────────────────────────────────────────

    @Test
    void search_delegatesToRepository() {
        when(eventRepo.search(EventType.TRYOUT, "OR", GenderCategory.MEN, null))
                .thenReturn(List.of(publishedEvent));

        List<EventResponse> result = eventService.search(
                EventType.TRYOUT, "OR", GenderCategory.MEN, null);

        assertThat(result).hasSize(1);
        verify(eventRepo).search(EventType.TRYOUT, "OR", GenderCategory.MEN, null);
    }

    // ── publish ───────────────────────────────────────────────────────────────

    @Test
    void publish_setsPublishedTrue() {
        Event draft = Event.builder()
                .id(EVENT_ID)
                .name("Draft Event")
                .slug("draft-event")
                .type(EventType.GAME)
                .isPublished(false)
                .build();

        lenient().when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.CONFIRMED))
                .thenReturn(0L);
        lenient().when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.WAITLISTED))
                .thenReturn(0L);

        when(eventRepo.findBySlug("draft-event")).thenReturn(Optional.of(draft));
        when(eventRepo.save(draft)).thenReturn(draft);

        eventService.publish("draft-event");

        assertThat(draft.isPublished()).isTrue();
        verify(eventRepo).save(draft);
    }

    @Test
    void publish_eventNotFound_throwsIllegalArgumentException() {
        when(eventRepo.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.publish("ghost"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── cancel ────────────────────────────────────────────────────────────────

    @Test
    void cancel_setsIsCancelledAndReason() {
        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(eventRepo.save(publishedEvent)).thenReturn(publishedEvent);

        eventService.cancel("summer-tryout", "Venue unavailable");

        assertThat(publishedEvent.isCancelled()).isTrue();
        assertThat(publishedEvent.getCancelledReason()).isEqualTo("Venue unavailable");
        verify(eventRepo).save(publishedEvent);
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    void delete_softDeletesSetsDeletedAt() {
        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));

        eventService.delete("summer-tryout");

        assertThat(publishedEvent.getDeletedAt()).isNotNull();
        verify(eventRepo).save(publishedEvent);
    }

    @Test
    void delete_eventNotFound_throwsIllegalArgumentException() {
        when(eventRepo.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.delete("ghost"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    void register_underCapacity_registersAsConfirmed() {
        User registrant = User.builder().id(USER_ID).build();

        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(regRepo.existsByUser_IdAndEvent_Id(USER_ID, EVENT_ID)).thenReturn(false);
        when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.CONFIRMED))
                .thenReturn(5L);
        when(userRepo.getReferenceById(USER_ID)).thenReturn(registrant);
        when(regRepo.save(any(EventRegistration.class))).thenAnswer(inv -> {
            EventRegistration r = inv.getArgument(0);
            // simulate saved registration with same fields
            return EventRegistration.builder()
                    .id(UUID.randomUUID())
                    .event(publishedEvent)
                    .user(registrant)
                    .status(r.getStatus())
                    .build();
        });

        EventRegistrationResponse result = eventService.register(
                "summer-tryout", USER_ID, null);

        assertThat(result.status()).isEqualTo(RegistrationStatus.CONFIRMED);
    }

    @Test
    void register_atCapacityWithWaitlist_registersAsWaitlisted() {
        User registrant = User.builder().id(USER_ID).build();

        Event waitlistEvent = Event.builder()
                .id(EVENT_ID)
                .name("Full Tryout")
                .slug("full-tryout")
                .type(EventType.TRYOUT)
                .isPublished(true)
                .isCancelled(false)
                .allowsIndividualReg(true)
                .capacity((short) 10)
                .waitlistEnabled(true)
                .waitlistCapacity((short) 5)
                .hostUser(hostUser)
                .startDate(LocalDate.now().plusDays(10))
                .build();

        when(eventRepo.findBySlug("full-tryout")).thenReturn(Optional.of(waitlistEvent));
        when(regRepo.existsByUser_IdAndEvent_Id(USER_ID, EVENT_ID)).thenReturn(false);
        when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.CONFIRMED))
                .thenReturn(10L); // at capacity
        when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.WAITLISTED))
                .thenReturn(2L);
        when(userRepo.getReferenceById(USER_ID)).thenReturn(registrant);
        when(regRepo.save(any(EventRegistration.class))).thenAnswer(inv -> {
            EventRegistration r = inv.getArgument(0);
            return EventRegistration.builder()
                    .id(UUID.randomUUID())
                    .event(waitlistEvent)
                    .user(registrant)
                    .status(r.getStatus())
                    .waitlistPosition(r.getWaitlistPosition())
                    .build();
        });

        EventRegistrationResponse result = eventService.register(
                "full-tryout", USER_ID, null);

        assertThat(result.status()).isEqualTo(RegistrationStatus.WAITLISTED);
        assertThat(result.waitlistPosition()).isEqualTo((short) 3);
    }

    @Test
    void register_eventFull_noWaitlist_throwsIllegalStateException() {
        Event fullEvent = Event.builder()
                .id(EVENT_ID)
                .name("Full Tryout")
                .slug("full-tryout")
                .type(EventType.TRYOUT)
                .isPublished(true)
                .isCancelled(false)
                .allowsIndividualReg(true)
                .capacity((short) 10)
                .waitlistEnabled(false)
                .hostUser(hostUser)
                .startDate(LocalDate.now().plusDays(10))
                .build();

        when(eventRepo.findBySlug("full-tryout")).thenReturn(Optional.of(fullEvent));
        when(regRepo.existsByUser_IdAndEvent_Id(USER_ID, EVENT_ID)).thenReturn(false);
        when(regRepo.countByEvent_IdAndStatus(EVENT_ID, RegistrationStatus.CONFIRMED))
                .thenReturn(10L);

        assertThatThrownBy(() -> eventService.register("full-tryout", USER_ID, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("full");
    }

    @Test
    void register_alreadyRegistered_throwsIllegalStateException() {
        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(regRepo.existsByUser_IdAndEvent_Id(USER_ID, EVENT_ID)).thenReturn(true);

        assertThatThrownBy(() -> eventService.register("summer-tryout", USER_ID, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Already registered");
    }

    @Test
    void register_cancelledEvent_throwsIllegalStateException() {
        Event cancelled = Event.builder()
                .id(EVENT_ID)
                .name("Cancelled")
                .slug("cancelled")
                .type(EventType.TRYOUT)
                .isPublished(true)
                .isCancelled(true)
                .allowsIndividualReg(true)
                .capacity((short) 20)
                .hostUser(hostUser)
                .startDate(LocalDate.now().plusDays(5))
                .build();

        when(eventRepo.findBySlug("cancelled")).thenReturn(Optional.of(cancelled));

        assertThatThrownBy(() -> eventService.register("cancelled", USER_ID, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    void register_individualRegNotAllowed_throwsIllegalStateException() {
        Event teamOnlyEvent = Event.builder()
                .id(EVENT_ID)
                .name("Team Only")
                .slug("team-only")
                .type(EventType.TOURNAMENT)
                .isPublished(true)
                .isCancelled(false)
                .allowsIndividualReg(false)
                .allowsTeamReg(true)
                .capacity((short) 32)
                .hostUser(hostUser)
                .startDate(LocalDate.now().plusDays(60))
                .build();

        when(eventRepo.findBySlug("team-only")).thenReturn(Optional.of(teamOnlyEvent));

        assertThatThrownBy(() -> eventService.register("team-only", USER_ID, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("individual registration");
    }

    // ── cancelRegistration ────────────────────────────────────────────────────

    @Test
    void cancelRegistration_success_setsStatusCancelled() {
        User registrant = User.builder().id(USER_ID).build();
        EventRegistration reg = EventRegistration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .user(registrant)
                .status(RegistrationStatus.CONFIRMED)
                .build();

        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(regRepo.findByUser_IdAndEvent_Id(USER_ID, EVENT_ID)).thenReturn(Optional.of(reg));
        when(regRepo.save(any(EventRegistration.class))).thenAnswer(inv -> inv.getArgument(0));

        EventRegistrationResponse result = eventService.cancelRegistration(
                "summer-tryout", USER_ID);

        assertThat(result.status()).isEqualTo(RegistrationStatus.CANCELLED);
        assertThat(reg.getCancelledAt()).isNotNull();
    }

    @Test
    void cancelRegistration_alreadyCancelled_throwsIllegalStateException() {
        User registrant = User.builder().id(USER_ID).build();
        EventRegistration alreadyCancelled = EventRegistration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .user(registrant)
                .status(RegistrationStatus.CANCELLED)
                .build();

        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(regRepo.findByUser_IdAndEvent_Id(USER_ID, EVENT_ID))
                .thenReturn(Optional.of(alreadyCancelled));

        assertThatThrownBy(() -> eventService.cancelRegistration("summer-tryout", USER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    void cancelRegistration_registrationNotFound_throwsIllegalArgumentException() {
        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(regRepo.findByUser_IdAndEvent_Id(USER_ID, EVENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.cancelRegistration("summer-tryout", USER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Registration not found");
    }

    // ── getMyRegistrations ────────────────────────────────────────────────────

    @Test
    void getMyRegistrations_returnsUserRegistrationsInOrder() {
        User registrant = User.builder().id(USER_ID).build();
        EventRegistration reg = EventRegistration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .user(registrant)
                .status(RegistrationStatus.CONFIRMED)
                .build();

        when(regRepo.findByUser_IdOrderByRegisteredAtDesc(USER_ID)).thenReturn(List.of(reg));

        List<EventRegistrationResponse> result = eventService.getMyRegistrations(USER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo(RegistrationStatus.CONFIRMED);
        verify(regRepo).findByUser_IdOrderByRegisteredAtDesc(USER_ID);
    }

    // ── getEventRegistrations ─────────────────────────────────────────────────

    @Test
    void getEventRegistrations_returnsAllRegistrationsForEvent() {
        User registrant = User.builder().id(USER_ID).build();
        EventRegistration reg = EventRegistration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .user(registrant)
                .status(RegistrationStatus.CONFIRMED)
                .build();

        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(regRepo.findByEvent_IdOrderByRegisteredAtAsc(EVENT_ID)).thenReturn(List.of(reg));

        List<EventRegistrationResponse> result = eventService.getEventRegistrations("summer-tryout");

        assertThat(result).hasSize(1);
    }

    @Test
    void getEventRegistrations_eventNotFound_throwsIllegalArgumentException() {
        when(eventRepo.findBySlug("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.getEventRegistrations("ghost"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    void update_success_updatesFieldsAndSaves() {
        when(eventRepo.findBySlug("summer-tryout")).thenReturn(Optional.of(publishedEvent));
        when(eventRepo.save(any(Event.class))).thenReturn(publishedEvent);

        EventRequest updateReq = new EventRequest(
                "Summer Tryout Updated",   // name
                EventType.TRYOUT,          // type
                "Updated desc",            // description
                null,                      // genderCategory
                null,                      // skillLevel
                null,                      // hostClubId
                "New Venue",               // venueName
                null,                      // addressLine1
                null,                      // addressLine2
                "Portland",                // city
                "OR",                      // state
                null,                      // zipCode
                LocalDate.now().plusDays(30), // startDate
                null,                      // endDate
                null,                      // startTime
                null,                      // endTime
                null,                      // registrationOpensAt
                null,                      // registrationClosesAt
                (short) 25,                // capacity
                false,                     // waitlistEnabled
                null,                      // waitlistCapacity
                null,                      // individualFee
                null,                      // teamFee
                true,                      // allowsIndividualReg
                false,                     // allowsTeamReg
                null,                      // leagueId
                null,                      // seasonId
                null,                      // minAge
                null,                      // maxAge
                null,                      // imageUrl
                null,                      // website
                null,                      // contactEmail
                null,                      // contactPhone
                true                       // isPublished
        );

        eventService.update("summer-tryout", updateReq);

        assertThat(publishedEvent.getName()).isEqualTo("Summer Tryout Updated");
        assertThat(publishedEvent.getCapacity()).isEqualTo((short) 25);
        verify(eventRepo).save(publishedEvent);
    }
}
