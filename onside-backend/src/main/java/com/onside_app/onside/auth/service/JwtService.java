package com.onside_app.onside.auth.service;

import com.onside_app.onside.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@Service
public class JwtService {

    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;
    private final JwtProperties jwtProperties;

    public JwtService(RSAPrivateKey privateKey,
                      RSAPublicKey publicKey,
                      JwtProperties jwtProperties) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.jwtProperties = jwtProperties;
    }

    // ── Generate access token ──────────────────────────────────────────────────

    public String generateAccessToken(UUID userId, String email, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getAccessTokenExpiry());

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(jwtProperties.getIssuer())
                .issuedAt(now)
                .expiration(expiry)
                .claims(Map.of(
                        "email", email,
                        "roles", roles
                ))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    // ── Validate token and extract claims ──────────────────────────────────────

    public Claims validateAndExtractClaims(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── Extract specific claims ────────────────────────────────────────────────

    public UUID extractUserId(String token) {
        return UUID.fromString(
                validateAndExtractClaims(token).getSubject()
        );
    }

    public String extractEmail(String token) {
        return validateAndExtractClaims(token).get("email", String.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return validateAndExtractClaims(token).get("roles", List.class);
    }

    // ── Validity check without throwing ───────────────────────────────────────

    public boolean isTokenValid(String token) {
        try {
            validateAndExtractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    public long getAccessTokenExpiry() {
        return jwtProperties.getAccessTokenExpiry();
    }

    public long getRefreshTokenExpiry() {
        return jwtProperties.getRefreshTokenExpiry();
    }
}