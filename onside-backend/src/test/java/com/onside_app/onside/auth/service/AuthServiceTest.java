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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock UserRoleRepository userRoleRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "player@onside.app";
    private static final String PASSWORD = "password123";
    private static final String ENCODED = "encoded-password";
    private static final String ACCESS_TOKEN = "test.access.token";
    private static final long EXPIRY_MS = 3_600_000L;
    private static final long REFRESH_EXPIRY_MS = 604_800_000L;

    private User testUser;
    private UserProfile testProfile;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .email(EMAIL)
                .passwordHash(ENCODED)
                .isActive(true)
                .build();

        testProfile = UserProfile.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .firstName("John")
                .lastName("Doe")
                .build();

        // Common stubs used across multiple tests
        lenient().when(jwtService.generateAccessToken(any(), anyString(), anyList()))
                .thenReturn(ACCESS_TOKEN);
        lenient().when(jwtService.getAccessTokenExpiry()).thenReturn(EXPIRY_MS);
        lenient().when(jwtService.getRefreshTokenExpiry()).thenReturn(REFRESH_EXPIRY_MS);
        lenient().when(passwordEncoder.encode(anyString())).thenReturn(ENCODED);
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    void register_success_returnsAuthResponseWithCorrectEmail() {
        when(userRepository.existsByEmailIgnoreCase(EMAIL)).thenReturn(false);

        RegisterRequest req = new RegisterRequest("John", "Doe", EMAIL, PASSWORD);
        AuthResponse response = authService.register(req);

        assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.user().email()).isEqualTo(EMAIL);
        assertThat(response.user().firstName()).isEqualTo("John");
        assertThat(response.user().lastName()).isEqualTo("Doe");
        assertThat(response.user().roles()).containsExactly(UserRole.BASIC_USER.name());
    }

    @Test
    void register_savesUser_withEncodedPassword() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        authService.register(new RegisterRequest("Jane", "Smith", "jane@onside.app", PASSWORD));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo(ENCODED);
        assertThat(captor.getValue().getEmail()).isEqualTo("jane@onside.app");
    }

    @Test
    void register_savesProfile_withCorrectNames() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        authService.register(new RegisterRequest("  Jane ", " Smith ", EMAIL, PASSWORD));

        ArgumentCaptor<UserProfile> captor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepository).save(captor.capture());
        assertThat(captor.getValue().getFirstName()).isEqualTo("Jane");
        assertThat(captor.getValue().getLastName()).isEqualTo("Smith");
    }

    @Test
    void register_assignsBasicUserRole() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        authService.register(new RegisterRequest("John", "Doe", EMAIL, PASSWORD));

        ArgumentCaptor<UserRoleEntity> captor = ArgumentCaptor.forClass(UserRoleEntity.class);
        verify(userRoleRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(UserRole.BASIC_USER);
    }

    @Test
    void register_emailAlreadyTaken_throwsIllegalStateException() {
        when(userRepository.existsByEmailIgnoreCase(EMAIL)).thenReturn(true);

        assertThatThrownBy(() ->
                authService.register(new RegisterRequest("John", "Doe", EMAIL, PASSWORD)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void register_emailNormalised_lowercaseStripped() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        authService.register(new RegisterRequest("John", "Doe", "  PLAYER@ONSIDE.APP  ", PASSWORD));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("player@onside.app");
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_success_returnsAuthResponse() {
        UserRoleEntity role = UserRoleEntity.builder()
                .role(UserRole.BASIC_USER).user(testUser).build();

        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(testUser));
        when(userRoleRepository.findByUserIdAndRevokedAtIsNull(USER_ID)).thenReturn(List.of(role));
        when(userProfileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(testProfile));

        AuthResponse response = authService.login(new LoginRequest(EMAIL, PASSWORD));

        assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
        assertThat(response.user().email()).isEqualTo(EMAIL);
        assertThat(response.user().roles()).containsExactly(UserRole.BASIC_USER.name());
    }

    @Test
    void login_updatesLastLoginAt() {
        UserRoleEntity role = UserRoleEntity.builder()
                .role(UserRole.BASIC_USER).user(testUser).build();

        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(testUser));
        when(userRoleRepository.findByUserIdAndRevokedAtIsNull(USER_ID)).thenReturn(List.of(role));
        when(userProfileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(testProfile));

        authService.login(new LoginRequest(EMAIL, PASSWORD));

        verify(userRepository).updateLastLoginAt(eq(USER_ID), any(OffsetDateTime.class));
    }

    @Test
    void login_invalidCredentials_throwsIllegalArgumentException() {
        doThrow(new BadCredentialsException("bad credentials"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, "wrong")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_userNotFoundAfterAuth_throwsIllegalArgumentException() {
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, PASSWORD)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void login_profileNotFound_throwsIllegalStateException() {
        UserRoleEntity role = UserRoleEntity.builder()
                .role(UserRole.BASIC_USER).user(testUser).build();

        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(testUser));
        when(userRoleRepository.findByUserIdAndRevokedAtIsNull(USER_ID)).thenReturn(List.of(role));
        when(userProfileRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, PASSWORD)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Profile not found");
    }

    // ── refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_validToken_rotatesAndReturnsNewTokens() {
        RefreshToken stored = RefreshToken.builder()
                .user(testUser)
                .tokenHash("stored-hash")
                .expiresAt(OffsetDateTime.now().plusHours(1))
                .build();

        UserRoleEntity role = UserRoleEntity.builder()
                .role(UserRole.BASIC_USER).user(testUser).build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(stored));
        when(userRoleRepository.findByUserIdAndRevokedAtIsNull(USER_ID)).thenReturn(List.of(role));
        when(userProfileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(testProfile));

        AuthResponse response = authService.refresh(new RefreshTokenRequest("raw-token"));

        assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
        assertThat(stored.isRevoked()).isTrue();
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    void refresh_tokenNotFound_throwsIllegalArgumentException() {
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("bad-token")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid refresh token");
    }

    @Test
    void refresh_revokedToken_throwsIllegalStateException() {
        RefreshToken revoked = RefreshToken.builder()
                .user(testUser)
                .tokenHash("revoked-hash")
                .expiresAt(OffsetDateTime.now().plusHours(1))
                .revokedAt(OffsetDateTime.now().minusMinutes(5))
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(revoked));

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("raw-token")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expired or revoked");
    }

    @Test
    void refresh_expiredToken_throwsIllegalStateException() {
        RefreshToken expired = RefreshToken.builder()
                .user(testUser)
                .tokenHash("expired-hash")
                .expiresAt(OffsetDateTime.now().minusHours(1))
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("raw-token")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expired or revoked");
    }

    // ── logout ────────────────────────────────────────────────────────────────

    @Test
    void logout_revokesTokenByHash() {
        MessageResponse response = authService.logout(new RefreshTokenRequest("raw-token"));

        verify(refreshTokenRepository).revokeByTokenHash(anyString(), any(OffsetDateTime.class));
        assertThat(response.message()).contains("Logged out");
    }

    @Test
    void logoutAll_revokesAllTokensForUser() {
        MessageResponse response = authService.logoutAll(USER_ID);

        verify(refreshTokenRepository).revokeAllByUserId(eq(USER_ID), any(OffsetDateTime.class));
        assertThat(response.message()).contains("all devices");
    }
}
