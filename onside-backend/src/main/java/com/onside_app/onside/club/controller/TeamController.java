package com.onside_app.onside.club.controller;

import com.onside_app.onside.club.dto.*;
import com.onside_app.onside.club.service.TeamService;
import com.onside_app.onside.common.enums.GenderCategory;
import com.onside_app.onside.common.enums.SkillLevel;
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

@Tag(name = "Teams", description = "Endpoints for managing teams and rosters")
@RestController
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    // ── GET /clubs/{slug}/teams ────────────────────────────────────────────────

    @Operation(summary = "Get teams by club", description = "Returns a list of all teams belonging to a specific club.")
    @GetMapping("/clubs/{clubSlug}/teams")
    public ResponseEntity<List<TeamResponseDto>> getTeamsByClub(
            @PathVariable String clubSlug) {

        return ResponseEntity.ok(teamService.getTeamsByClub(clubSlug));
    }

    // ── GET /clubs/{clubSlug}/teams/{teamSlug} ─────────────────────────────────

    @Operation(summary = "Get a team", description = "Returns the details of a specific team within a club.")
    @GetMapping("/clubs/{clubSlug}/teams/{teamSlug}")
    public ResponseEntity<TeamResponseDto> getTeam(
            @PathVariable String clubSlug,
            @PathVariable String teamSlug) {

        return ResponseEntity.ok(teamService.getTeam(clubSlug, teamSlug));
    }

    // ── GET /clubs/{clubSlug}/teams/{teamSlug}/roster ──────────────────────────

    @Operation(summary = "Get an active team roster", description = "Returns the active roster of players and coaches for a given team.")
    @GetMapping("/clubs/{clubSlug}/teams/{teamSlug}/roster")
    public ResponseEntity<List<TeamRosterResponseDto>> getActiveRoster(
            @PathVariable String clubSlug,
            @PathVariable String teamSlug) {

        return ResponseEntity.ok(
                teamService.getActiveRoster(clubSlug, teamSlug));
    }

    // ── GET /teams ─────────────────────────────────────────────────────────────

    @Operation(summary = "Browse teams", description = "Returns a list of teams matching the specified filter criteria.")
    @GetMapping("/teams")
    public ResponseEntity<List<TeamResponseDto>> browseTeams(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Boolean recruiting) {

        GenderCategory categoryEnum = parseEnum(GenderCategory.class, category);
        SkillLevel levelEnum = parseEnum(SkillLevel.class, level);

        return ResponseEntity.ok(
                teamService.browseTeams(categoryEnum, levelEnum, state, recruiting));
    }

    // ── GET /teams/search ──────────────────────────────────────────────────────

    @Operation(summary = "Search teams", description = "Searches for teams by name or category.")
    @GetMapping("/teams/search")
    public ResponseEntity<List<TeamResponseDto>> searchTeams(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category) {

        GenderCategory categoryEnum = parseEnum(GenderCategory.class, category);

        return ResponseEntity.ok(teamService.searchTeams(q, categoryEnum));
    }

    // ── POST /clubs/{clubSlug}/teams ───────────────────────────────────────────

    @Operation(summary = "Create a new team", description = "Creates a new team under a specific club.")
    @PostMapping("/clubs/{clubSlug}/teams")
    public ResponseEntity<TeamResponseDto> createTeam(
            @PathVariable String clubSlug,
            @Valid @RequestBody TeamRequestDto request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(teamService.createTeam(clubSlug, request,
                        currentUser.getId()));
    }

    // ── PUT /clubs/{clubSlug}/teams/{teamSlug} ─────────────────────────────────

    @Operation(summary = "Update a team", description = "Updates an existing team's information.")
    @PutMapping("/clubs/{clubSlug}/teams/{teamSlug}")
    public ResponseEntity<TeamResponseDto> updateTeam(
            @PathVariable String clubSlug,
            @PathVariable String teamSlug,
            @Valid @RequestBody TeamRequestDto request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                teamService.updateTeam(clubSlug, teamSlug, request,
                        currentUser.getId()));
    }

    // ── DELETE /clubs/{clubSlug}/teams/{teamSlug} ──────────────────────────────

    @Operation(summary = "Deactivate a team", description = "Deactivates a team, marking it as inactive.")
    @DeleteMapping("/clubs/{clubSlug}/teams/{teamSlug}")
    public ResponseEntity<Void> deactivateTeam(
            @PathVariable String clubSlug,
            @PathVariable String teamSlug,
            @AuthenticationPrincipal User currentUser) {

        teamService.deactivateTeam(clubSlug, teamSlug, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    // ── POST /clubs/{clubSlug}/teams/{teamSlug}/roster ─────────────────────────

    @Operation(summary = "Add a roster member", description = "Adds a player or coach to the team roster.")
    @PostMapping("/clubs/{clubSlug}/teams/{teamSlug}/roster")
    public ResponseEntity<TeamRosterResponseDto> addRosterMember(
            @PathVariable String clubSlug,
            @PathVariable String teamSlug,
            @Valid @RequestBody AddRosterMemberRequestDto request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(teamService.addRosterMember(clubSlug, teamSlug, request,
                        currentUser.getId()));
    }

    // ── DELETE /clubs/{clubSlug}/teams/{teamSlug}/roster/{userId} ──────────────

    @Operation(summary = "Remove a roster member", description = "Removes a player or coach from the team roster.")
    @DeleteMapping("/clubs/{clubSlug}/teams/{teamSlug}/roster/{userId}")
    public ResponseEntity<Void> removeRosterMember(
            @PathVariable String clubSlug,
            @PathVariable String teamSlug,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {

        teamService.removeRosterMember(clubSlug, teamSlug, userId,
                currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    // ── Helper: safe string → enum conversion ──────────────────────────────────
    // Returns null if the value is blank or not a valid enum constant.
    // Null is treated by the service as "no filter for this param".

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}