package com.onside_app.onside.club.controller;

import com.onside_app.onside.club.dto.*;
import com.onside_app.onside.club.service.ClubService;
import com.onside_app.onside.users.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Clubs", description = "Endpoints for managing clubs")
@RestController
@RequestMapping("/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    // ── GET /clubs ─────────────────────────────────────────────────────────────

    @Operation(summary = "Get all clubs", description = "Returns a list of all clubs, optionally filtered by state.")
    @GetMapping
    public ResponseEntity<List<ClubResponseDto>> getAllClubs(
            @RequestParam(required = false) String state) {

        return ResponseEntity.ok(clubService.getAllClubs(state));
    }

    // ── GET /clubs/search?q=georgia ────────────────────────────────────────────

    @Operation(summary = "Search for clubs", description = "Searches for clubs by name or other criteria.")
    @GetMapping("/search")
    public ResponseEntity<List<ClubResponseDto>> searchClubs(
            @RequestParam(required = false) String q) {

        return ResponseEntity.ok(clubService.searchClubs(q));
    }

    // ── GET /clubs/mine ────────────────────────────────────────────────────────

    @Operation(summary = "Get my clubs", description = "Returns a list of clubs managed by the current user.")
    @GetMapping("/mine")
    public ResponseEntity<List<ClubResponseDto>> getMyClubs(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(clubService.getMyClubs(currentUser.getId()));
    }

    // ── GET /clubs/{slug} ──────────────────────────────────────────────────────

    @Operation(summary = "Get a club by slug", description = "Returns a single club by its unique slug.")
    @GetMapping("/{slug}")
    public ResponseEntity<ClubResponseDto> getClub(
            @PathVariable String slug) {

        return ResponseEntity.ok(clubService.getClubBySlug(slug));
    }

    // ── GET /clubs/{slug}/staff ────────────────────────────────────────────────

    @Operation(summary = "Get club staff", description = "Returns a list of staff members for a given club.")
    @GetMapping("/{slug}/staff")
    public ResponseEntity<List<ClubStaffResponseDto>> getClubStaff(
            @PathVariable String slug) {

        return ResponseEntity.ok(clubService.getClubStaff(slug));
    }

    // ── POST /clubs ────────────────────────────────────────────────────────────

    @Operation(summary = "Create a new club", description = "Creates a new club and assigns the current user as an administrator.")
    @PostMapping
    public ResponseEntity<ClubResponseDto> createClub(
            @Valid @RequestBody ClubRequestDto request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clubService.createClub(request, currentUser.getId()));
    }

    // ── PUT /clubs/{slug} ──────────────────────────────────────────────────────

    @Operation(summary = "Update a club", description = "Updates an existing club's information.")
    @PutMapping("/{slug}")
    public ResponseEntity<ClubResponseDto> updateClub(
            @PathVariable String slug,
            @Valid @RequestBody ClubRequestDto request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                clubService.updateClub(slug, request, currentUser.getId()));
    }

    // ── DELETE /clubs/{slug} ───────────────────────────────────────────────────

    @Operation(summary = "Deactivate a club", description = "Deactivates a club, marking it as inactive.")
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deactivateClub(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {

        clubService.deactivateClub(slug, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    // ── POST /clubs/{slug}/staff ───────────────────────────────────────────────

    @Operation(summary = "Add a staff member", description = "Adds a new staff member to a club.")
    @PostMapping("/{slug}/staff")
    public ResponseEntity<ClubStaffResponseDto> addStaff(
            @PathVariable String slug,
            @Valid @RequestBody AddStaffRequestDto request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clubService.addStaff(slug, request, currentUser.getId()));
    }

    // ── DELETE /clubs/{slug}/staff/{userId} ────────────────────────────────────

    @Operation(summary = "Remove a staff member", description = "Removes a staff member from a club.")
    @DeleteMapping("/{slug}/staff/{userId}")
    public ResponseEntity<Void> removeStaff(
            @PathVariable String slug,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {

        clubService.removeStaff(slug, userId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
