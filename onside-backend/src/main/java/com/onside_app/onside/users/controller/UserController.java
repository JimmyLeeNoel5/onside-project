package com.onside_app.onside.users.controller;

import com.onside_app.onside.users.dto.UserResponseDto;
import com.onside_app.onside.users.dto.UserUpdateDto;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Users", description = "Endpoints for user profile management")
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ── GET /api/v1/users/me ───────────────────────────────────────────────────

    /**
     * Returns the full profile of the currently logged-in user.
     *
     * How does @AuthenticationPrincipal work?
     * When a request comes in with a JWT, Spring Security's filter chain
     * validates the token and loads the User entity from the database.
     * That User entity is stored in the SecurityContext for the duration
     * of the request. @AuthenticationPrincipal injects it directly here —
     * so we always have the real User object, never just a username string.
     * This is the same pattern used in ClubController and EventController.
     *
     * Auth required: yes — this endpoint is protected by JWT.
     * An unauthenticated request will be rejected by Spring Security before
     * it even reaches this method.
     */
    @Operation(summary = "Get current user profile", description = "Returns the profile of the currently authenticated user.")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMe(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(userService.getMe(currentUser.getId()));
    }

    // ── PUT /api/v1/users/me ───────────────────────────────────────────────────

    /**
     * Updates the logged-in user's profile.
     *
     * Why PUT instead of PATCH?
     * Strictly speaking, PATCH is more correct for partial updates. However,
     * the frontend sends the full form state on save, and the partial update
     * logic (null checks) is handled in UserService — not at the HTTP level.
     * PUT is simpler and consistent with how other update endpoints are built
     * in this project (see ClubController.updateClub, TeamController.updateTeam).
     *
     * @Valid triggers validation annotations on UserUpdateDto
     * (e.g. @Size, @Min, @Max) and returns 400 if any are violated.
     *
     * Returns the full updated profile (200 OK) so the frontend can
     * immediately refresh its state without a separate GET call.
     */
    @Operation(summary = "Update current user profile", description = "Updates the profile information of the currently authenticated user.")
    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateMe(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UserUpdateDto request) {

        return ResponseEntity.ok(
                userService.updateMe(currentUser.getId(), request));
    }
}