package com.onside_app.onside.auth.service;

import com.onside_app.onside.auth.dto.*;
import com.onside_app.onside.auth.entity.RefreshToken;
import com.onside_app.onside.auth.repository.RefreshTokenRepository;
import com.onside_app.onside.common.enums.UserRole;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.entity.UserProfile;
import com.onside_app.onside.users.entity.UserRoleEntity;
import com.onside_app.onside.users.repository.UserProfileRepository;
import com.onside_app.onside.users.repository.UserRepository;
import com.onside_app.onside.users.repository.UserRoleRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            UserRoleRepository userRoleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userRoleRepository = userRoleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // ── Registration ───────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // 1. Check email not already taken — 409 Conflict
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalStateException(
                    "An account with this email already exists"
            );
        }

        // 2. Create and save the user (auth/identity only)
        User user = User.builder()
                .email(request.email().toLowerCase().strip())
                .passwordHash(passwordEncoder.encode(request.password()))
                .isActive(true)
                .isEmailVerified(false)
                .build();
        userRepository.save(user);

        // 3. Create and save the profile (personal data)
        UserProfile profile = UserProfile.builder()
                .user(user)
                .firstName(request.firstName().strip())
                .lastName(request.lastName().strip())
                .build();
        userProfileRepository.save(profile);

        // 4. Assign default BASIC_USER role
        UserRoleEntity role = UserRoleEntity.builder()
                .user(user)
                .role(UserRole.BASIC_USER)
                .build();
        userRoleRepository.save(role);

        // 5. Build role list for the token
        List<String> roles = List.of(UserRole.BASIC_USER.name());

        // 6. Generate tokens
        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), roles
        );
        RefreshToken refreshToken = buildAndSaveRefreshToken(user);

        // 7. Return response
        return AuthResponse.of(
                accessToken,
                refreshToken.getTokenHash(),
                jwtService.getAccessTokenExpiry(),
                new AuthResponse.UserSummary(
                        user.getId().toString(),
                        user.getEmail(),
                        profile.getFirstName(),
                        profile.getLastName(),
                        roles
                )
        );
    }

    // ── Login ──────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest request) {

        // 1. Authenticate via Spring Security
        // Throws AuthenticationException if credentials are wrong — 401
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // 2. Load the user — 404 if somehow missing after auth
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password"));

        // 3. Load active roles
        List<String> roles = userRoleRepository
                .findByUserIdAndRevokedAtIsNull(user.getId())
                .stream()
                .map(r -> r.getRole().name())
                .toList();

        // 4. Generate tokens
        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), roles
        );
        RefreshToken refreshToken = buildAndSaveRefreshToken(user);

        // 5. Update last login timestamp
        userRepository.updateLastLoginAt(user.getId(), OffsetDateTime.now());

        // 6. Load profile for response
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Profile not found for user"));

        return AuthResponse.of(
                accessToken,
                refreshToken.getTokenHash(),
                jwtService.getAccessTokenExpiry(),
                new AuthResponse.UserSummary(
                        user.getId().toString(),
                        user.getEmail(),
                        profile.getFirstName(),
                        profile.getLastName(),
                        roles
                )
        );
    }

    // ── Token refresh ──────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {

        // 1. Hash the incoming raw token to look it up
        String tokenHash = hashToken(request.refreshToken());

        // 2. Find and validate — 404 if not found, 409 if expired/revoked
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid refresh token"));

        if (!stored.isValid()) {
            throw new IllegalStateException(
                    "Refresh token is expired or revoked");
        }

        // 3. Revoke the old token (rotation — one token per session)
        stored.revoke();
        refreshTokenRepository.save(stored);

        // 4. Load user and roles
        User user = stored.getUser();
        List<String> roles = userRoleRepository
                .findByUserIdAndRevokedAtIsNull(user.getId())
                .stream()
                .map(r -> r.getRole().name())
                .toList();

        // 5. Issue new tokens
        String newAccessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), roles
        );
        RefreshToken newRefreshToken = buildAndSaveRefreshToken(user);

        // 6. Load profile for response
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Profile not found for user"));

        return AuthResponse.of(
                newAccessToken,
                newRefreshToken.getTokenHash(),
                jwtService.getAccessTokenExpiry(),
                new AuthResponse.UserSummary(
                        user.getId().toString(),
                        user.getEmail(),
                        profile.getFirstName(),
                        profile.getLastName(),
                        roles
                )
        );
    }

    // ── Logout ─────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse logout(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.refreshToken());
        refreshTokenRepository.revokeByTokenHash(tokenHash, OffsetDateTime.now());
        return MessageResponse.of("Logged out successfully");
    }

    // ── Logout all devices ─────────────────────────────────────────────────────

    @Transactional
    public MessageResponse logoutAll(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId, OffsetDateTime.now());
        return MessageResponse.of("Logged out from all devices");
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private RefreshToken buildAndSaveRefreshToken(User user) {
        // Generate a raw random token
        String rawToken = UUID.randomUUID().toString()
                + UUID.randomUUID().toString();

        // Hash it for storage — we never store raw tokens
        String tokenHash = hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .issuedAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusSeconds(
                        jwtService.getRefreshTokenExpiry() / 1000
                ))
                .build();

        refreshTokenRepository.save(token);

        // IMPORTANT: temporarily swap tokenHash to raw token for the response
        // The caller returns rawToken to the client, not the hash
        token = RefreshToken.builder()
                .user(user)
                .tokenHash(rawToken)
                .issuedAt(token.getIssuedAt())
                .expiresAt(token.getExpiresAt())
                .build();

        return token;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8)
            );
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}