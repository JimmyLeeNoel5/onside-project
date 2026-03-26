package com.onside_app.onside.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.stream.Collectors;

@Configuration
public class RsaKeyConfig {

    private final JwtProperties jwtProperties;
    private final ResourceLoader resourceLoader;

    public RsaKeyConfig(JwtProperties jwtProperties, ResourceLoader resourceLoader) {
        this.jwtProperties = jwtProperties;
        this.resourceLoader = resourceLoader;
    }

    @Bean
    public RSAPrivateKey rsaPrivateKey() throws Exception {
        String base64 = readPemBody(jwtProperties.getPrivateKeyPath());
        byte[] decoded = Base64.getDecoder().decode(base64);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
        return (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    @Bean
    public RSAPublicKey rsaPublicKey() throws Exception {
        String base64 = readPemBody(jwtProperties.getPublicKeyPath());
        byte[] decoded = Base64.getDecoder().decode(base64);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    // ── Read PEM file and return only the Base64 body ─────────────────────────
    // Skips header (-----BEGIN ...) and footer (-----END ...) lines entirely
    // then joins the remaining lines into a single Base64 string

    private String readPemBody(String path) throws Exception {
        org.springframework.core.io.Resource resource =
                resourceLoader.getResource(path);

        try (InputStream is = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {

            return reader.lines()
                    .filter(line -> !line.startsWith("-----"))
                    .collect(Collectors.joining());
        }
    }
}