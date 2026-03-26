package com.onside_app.onside.auth.service;

import com.onside_app.onside.common.enums.UserRole;
import com.onside_app.onside.users.entity.User;
import com.onside_app.onside.users.entity.UserRoleEntity;
import com.onside_app.onside.users.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── UserDetailsService contract ────────────────────────────────────────────
    // Called by Spring Security's DaoAuthenticationProvider during login.
    // Returns a Spring UserDetails wrapper — used only for password verification.
    // NOT used as the principal stored in the SecurityContext (see JwtAuthFilter).

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found for email: " + email
                ));

        return buildUserDetails(user);
    }

    // ── NEW: load the real User entity by email ────────────────────────────────
    // This is called from JwtAuthFilter after token validation.
    // The returned User entity is stored as the principal in the SecurityContext,
    // which is what allows @AuthenticationPrincipal User currentUser to work
    // in controllers like UserController, ClubController, EventController, etc.
    //
    // Why a separate method instead of reusing loadUserByUsername?
    // loadUserByUsername returns a Spring UserDetails wrapper (not our entity).
    // We need the actual User entity as the principal — this method gives us that
    // without changing the UserDetailsService contract.

    @Transactional(readOnly = true)
    public User loadUserEntityByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found for email: " + email
                ));
    }

    // ── Build Spring Security UserDetails from our User entity ─────────────────
    // Still used by DaoAuthenticationProvider for login (password verification).
    // The resulting object is NOT stored as the SecurityContext principal —
    // that's now the real User entity (set in JwtAuthFilter).

    public UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(mapRolesToAuthorities(user.getRoles()))
                .accountExpired(false)
                .accountLocked(!user.isActive())
                .credentialsExpired(false)
                .disabled(!user.isActive())
                .build();
    }

    // ── Map our UserRoleEntity set to Spring GrantedAuthority list ─────────────

    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(
            java.util.Set<UserRoleEntity> roles) {

        if (roles == null || roles.isEmpty()) {
            // Default to BASIC_USER if no roles assigned
            return List.of(
                    new SimpleGrantedAuthority("ROLE_" + UserRole.BASIC_USER.name())
            );
        }

        return roles.stream()
                .filter(UserRoleEntity::isActive)
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRole().name()))
                .collect(Collectors.toList());
    }
}