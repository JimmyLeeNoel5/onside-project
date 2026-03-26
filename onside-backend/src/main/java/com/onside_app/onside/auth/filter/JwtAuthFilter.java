package com.onside_app.onside.auth.filter;

import com.onside_app.onside.auth.service.JwtService;
import com.onside_app.onside.auth.service.UserDetailsServiceImpl;
import com.onside_app.onside.users.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthFilter(JwtService jwtService,
                         UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // ── No token — pass through to the next filter ─────────────────────────
        // Spring Security will reject unauthenticated access to protected routes.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7); // strip "Bearer "

        try {
            Claims claims = jwtService.validateAndExtractClaims(token);
            String email = claims.get("email", String.class);

            // Only set authentication if not already set for this request
            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // ── Load UserDetails for authorities (roles) ───────────────────
                // We still need the Spring UserDetails wrapper to get the
                // GrantedAuthority list (roles) for the authentication token.
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                // ── Load the real User entity as the principal ─────────────────
                // This is the key fix: instead of storing the Spring UserDetails
                // wrapper as the principal, we store our actual User entity.
                //
                // Why this matters:
                // Controllers use @AuthenticationPrincipal User currentUser to
                // get the logged-in user. Spring injects whatever object is stored
                // as the principal here. If it's a Spring UserDetails wrapper,
                // the cast to our User entity fails and currentUser is null.
                // By storing the real User entity, @AuthenticationPrincipal works
                // correctly in ALL controllers (UserController, ClubController,
                // EventController, etc.).
                User userEntity =
                        userDetailsService.loadUserEntityByEmail(email);

                // Build the authentication token:
                //   principal   = real User entity (injected via @AuthenticationPrincipal)
                //   credentials = null (already authenticated via JWT, no password needed)
                //   authorities = roles from UserDetails wrapper
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userEntity,                     // ← real User entity
                                null,
                                userDetails.getAuthorities()    // ← roles from UserDetails
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Store in SecurityContext — available for the rest of this request
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (JwtException e) {
            // Invalid or expired token — clear context and continue.
            // Spring Security will return 401 for any protected routes.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}