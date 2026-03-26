package com.onside_app.onside.event.controller;

import com.onside_app.onside.common.enums.EventType;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.event.dto.*;
import com.onside_app.onside.event.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Tag(name = "Events", description = "Endpoints for managing events and registrations")
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // ── Public endpoints ──────────────────────────────────────────────────────

    @Operation(summary = "Get published events", description = "Returns a list of all published events.")
    @GetMapping
    public ResponseEntity<List<EventResponse>> getPublished() {
        return ResponseEntity.ok(eventService.getPublished());
    }

    @Operation(summary = "Search events", description = "Searches for events based on type, state, gender category, and from date.")
    @GetMapping("/search")
    public ResponseEntity<List<EventResponse>> search(
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) GenderCategory gender,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate
    ) {
        return ResponseEntity.ok(eventService.search(type, state, gender, fromDate));
    }

    @Operation(summary = "Get event by slug", description = "Returns details of a specific event.")
    @GetMapping("/{slug}")
    public ResponseEntity<EventResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(eventService.getBySlug(slug));
    }

    // ── Authenticated endpoints ───────────────────────────────────────────────

    @Operation(summary = "Create an event", description = "Creates a new event.")
    @PostMapping
    public ResponseEntity<EventResponse> create(
            @Valid @RequestBody EventRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.create(req, userId));
    }

    @Operation(summary = "Update an event", description = "Updates an existing event.")
    @PutMapping("/{slug}")
    public ResponseEntity<EventResponse> update(
            @PathVariable String slug,
            @Valid @RequestBody EventRequest req
    ) {
        return ResponseEntity.ok(eventService.update(slug, req));
    }

    @Operation(summary = "Publish an event", description = "Publishes a draft event.")
    @PatchMapping("/{slug}/publish")
    public ResponseEntity<EventResponse> publish(@PathVariable String slug) {
        return ResponseEntity.ok(eventService.publish(slug));
    }

    @Operation(summary = "Cancel an event", description = "Cancels a published event.")
    @PatchMapping("/{slug}/cancel")
    public ResponseEntity<EventResponse> cancel(
            @PathVariable String slug,
            @RequestParam(required = false) String reason
    ) {
        return ResponseEntity.ok(eventService.cancel(slug, reason));
    }

    @Operation(summary = "Delete an event", description = "Deletes an event.")
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        eventService.delete(slug);
        return ResponseEntity.noContent().build();
    }

    // ── Registration endpoints ────────────────────────────────────────────────

    @Operation(summary = "Register for an event", description = "Registers the current user for an event.")
    @PostMapping("/{slug}/register")
    public ResponseEntity<EventRegistrationResponse> register(
            @PathVariable String slug,
            @RequestBody(required = false) EventRegistrationRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.register(slug, userId, req));
    }

    @Operation(summary = "Cancel registration", description = "Cancels the current user's registration for an event.")
    @DeleteMapping("/{slug}/register")
    public ResponseEntity<EventRegistrationResponse> cancelRegistration(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(eventService.cancelRegistration(slug, userId));
    }

    @Operation(summary = "Get my registrations", description = "Returns a list of events the current user is registered for.")
    @GetMapping("/my-registrations")
    public ResponseEntity<List<EventRegistrationResponse>> myRegistrations(
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(eventService.getMyRegistrations(userId));
    }

    @Operation(summary = "Get event registrations", description = "Returns a list of all registrations for a specific event.")
    @GetMapping("/{slug}/registrations")
    public ResponseEntity<List<EventRegistrationResponse>> eventRegistrations(
            @PathVariable String slug
    ) {
        return ResponseEntity.ok(eventService.getEventRegistrations(slug));
    }
}