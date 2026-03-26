package com.onside_app.onside.league.controller;

import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.LeagueType;
import com.onside_app.onside.common.enums.SkillLevel;
import com.onside_app.onside.league.dto.LeagueRequestDto;
import com.onside_app.onside.league.dto.LeagueResponseDto;
import com.onside_app.onside.league.service.LeagueService;
import com.onside_app.onside.users.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Leagues", description = "Endpoints for managing leagues")
@RestController
@RequestMapping("/leagues")
public class LeagueController {

    private final LeagueService leagueService;

    public LeagueController(LeagueService leagueService) {
        this.leagueService = leagueService;
    }

    // ── GET /leagues/mine ──────────────────────────────────────────────────────
    // Returns leagues the logged-in user is a member of.
    // Auth required: yes — uses @AuthenticationPrincipal to get the current user.
    //
    // IMPORTANT: this route must be declared BEFORE /{slug} otherwise Spring
    // will try to match "mine" as a slug and call getLeague("mine") instead.

    @Operation(summary = "Get my leagues", description = "Returns a list of leagues the current user is a member of.")
    @GetMapping("/mine")
    public ResponseEntity<List<LeagueResponseDto>> getMyLeagues(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(leagueService.getMyLeagues(currentUser.getId()));
    }

    // ── GET /leagues ───────────────────────────────────────────────────────────
    // Params accepted as Strings and converted manually to avoid Spring Boot 4
    // @RequestParam enum conversion issues with custom PostgreSQL ENUM types.

    @Operation(summary = "Get all leagues", description = "Returns a list of all leagues, optionally filtered by category, level, and type.")
    @GetMapping
    public ResponseEntity<List<LeagueResponseDto>> getAllLeagues(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String leagueType) {

        GenderCategory categoryEnum = parseEnum(GenderCategory.class, category);
        SkillLevel levelEnum = parseEnum(SkillLevel.class, level);
        LeagueType leagueTypeEnum = parseEnum(LeagueType.class, leagueType);

        return ResponseEntity.ok(
                leagueService.getAllLeagues(categoryEnum, levelEnum, leagueTypeEnum));
    }

    // ── GET /leagues/search?q=usl ──────────────────────────────────────────────

    @Operation(summary = "Search for leagues", description = "Searches for leagues by name or other criteria.")
    @GetMapping("/search")
    public ResponseEntity<List<LeagueResponseDto>> searchLeagues(
            @RequestParam(required = false) String q) {

        return ResponseEntity.ok(leagueService.searchLeagues(q));
    }

    // ── GET /leagues/{slug} ────────────────────────────────────────────────────

    @Operation(summary = "Get a league by slug", description = "Returns a single league by its unique slug.")
    @GetMapping("/{slug}")
    public ResponseEntity<LeagueResponseDto> getLeague(
            @PathVariable String slug) {

        return ResponseEntity.ok(leagueService.getLeagueBySlug(slug));
    }

    // ── POST /leagues ──────────────────────────────────────────────────────────

    @Operation(summary = "Create a new league", description = "Creates a new league. Requires SUPER_ADMIN role.")
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<LeagueResponseDto> createLeague(
            @Valid @RequestBody LeagueRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leagueService.createLeague(request));
    }

    // ── PUT /leagues/{slug} ────────────────────────────────────────────────────

    @Operation(summary = "Update a league", description = "Updates an existing league. Requires SUPER_ADMIN role.")
    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<LeagueResponseDto> updateLeague(
            @PathVariable String slug,
            @Valid @RequestBody LeagueRequestDto request) {

        return ResponseEntity.ok(leagueService.updateLeague(slug, request));
    }

    // ── DELETE /leagues/{slug} ─────────────────────────────────────────────────

    @Operation(summary = "Deactivate a league", description = "Deactivates a league. Requires SUPER_ADMIN role.")
    @DeleteMapping("/{slug}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deactivateLeague(@PathVariable String slug) {
        leagueService.deactivateLeague(slug);
        return ResponseEntity.noContent().build();
    }

    // ── Helper: safe string → enum conversion ──────────────────────────────────

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}