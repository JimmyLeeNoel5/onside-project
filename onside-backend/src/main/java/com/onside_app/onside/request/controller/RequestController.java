package com.onside_app.onside.request.controller;

import com.onside_app.onside.common.service.EmailService;

import com.onside_app.onside.request.dto.LeagueSubmissionRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RequestController
 *
 * Handles league addition and admin access requests.
 * Both endpoints are public (no auth required) so anyone can submit a request.
 * Requests are sent as plain-text emails via EmailService — no DB storage.
 *
 * POST /requests/league        — someone wants to add their league
 * POST /requests/admin-access  — someone wants admin privileges
 */
@Tag(name = "Requests", description = "Endpoints for public requests like adding a league or requesting admin access")
@RestController
@RequestMapping("/requests")
public class RequestController {

    private final EmailService emailService;

    public RequestController(EmailService emailService) {
        this.emailService = emailService;
    }

    // ── POST /requests/league ──────────────────────────────────────────────────
    // Sends an email to onsideussoccer.com@onsideussoccer.com with the
    // league details filled out by the requester.

    @Operation(summary = "Submit a league request", description = "Sends an email requesting to add a new league.")
    @PostMapping("/league")
    public ResponseEntity<Void> requestLeague(
            @Valid @RequestBody LeagueSubmissionRequestDto request) {

        String subject = "[Onside] New League Request — " + request.leagueName();

        String body = """
                New League Request
                ──────────────────────────────────────────
                League Name:   %s
                Contact Name:  %s
                Email:         %s
                Phone:         %s
                Location:      %s, %s
                League Type:   %s
                Team Count:    %s
                
                Message:
                %s
                ──────────────────────────────────────────
                Submitted via Onside — onsideussoccer.com
                """.formatted(
                request.leagueName(),
                request.contactName(),
                request.contactEmail(),
                request.contactPhone() != null ? request.contactPhone() : "—",
                request.city() != null ? request.city() : "—",
                request.state() != null ? request.state() : "—",
                request.leagueType() != null ? request.leagueType() : "—",
                request.teamCount() != null ? request.teamCount() : "—",
                request.message() != null ? request.message() : "—"
        );

        emailService.sendNotification(subject, body);
        return ResponseEntity.ok().build();
    }

    // ── POST /requests/admin-access ────────────────────────────────────────────
    // Sends an email with the admin access request details.

    @Operation(summary = "Request admin access", description = "Sends an email requesting admin access for a club, team, or league.")
    @PostMapping("/admin-access")
    public ResponseEntity<Void> requestAdminAccess(
            @Valid @RequestBody AdminAccessRequestDto request) {

        String subject = "[Onside] Admin Access Request — " + request.fullName()
                + " (" + request.accessType() + ")";

        String body = """
                Admin Access Request
                ──────────────────────────────────────────
                Full Name:        %s
                Email:            %s
                Phone:            %s
                Access Type:      %s
                Organization:     %s
                Role:             %s
                
                Reason:
                %s
                ──────────────────────────────────────────
                Submitted via Onside — onsideussoccer.com
                """.formatted(
                request.fullName(),
                request.email(),
                request.phone() != null ? request.phone() : "—",
                request.accessType(),
                request.organizationName(),
                request.role() != null ? request.role() : "—",
                request.reason() != null ? request.reason() : "—"
        );

        emailService.sendNotification(subject, body);
        return ResponseEntity.ok().build();
    }

    /**
     * AdminAccessRequestDto
     *
     * Submitted when someone wants admin/elevated access on Onside
     * to manage a club, team, or league.
     * Sent via email — no DB storage.
     */
    public static record AdminAccessRequestDto(

            @NotBlank(message = "Full name is required")
            @Size(max = 100)
            String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Must be a valid email address")
            String email,

            String phone,

            // What they want to manage: CLUB, TEAM, LEAGUE
            @NotBlank(message = "Access type is required")
            String accessType,

            // Name of the club, team, or league they want to manage
            @NotBlank(message = "Organization name is required")
            @Size(max = 150)
            String organizationName,

            // Their role: coach, club admin, league admin, team manager, etc.
            String role,

            // Why they should have access
            String reason
    ) {}
}