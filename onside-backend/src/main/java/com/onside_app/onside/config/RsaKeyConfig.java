package com.onside_app.onside.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
public class RsaKeyConfig {

    private final JwtProperties jwtProperties;

    public RsaKeyConfig(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Bean
    public RSAPrivateKey rsaPrivateKey() throws Exception {
        String key = resolveKey(jwtProperties.getPrivateKeyPath(), "JWT_PRIVATE_KEY");
        byte[] decoded = Base64.getDecoder().decode(stripPemHeaders(key));
        return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    @Bean
    public RSAPublicKey rsaPublicKey() throws Exception {
        String key = resolveKey(jwtProperties.getPublicKeyPath(), "JWT_PUBLIC_KEY");
        byte[] decoded = Base64.getDecoder().decode(stripPemHeaders(key));
        return (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(new X509EncodedKeySpec(decoded));
    }

    private String resolveKey(String path, String envVarName) throws Exception {
        String envValue = System.getenv(envVarName);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }
        org.springframework.core.io.ClassPathResource resource =
                new org.springframework.core.io.ClassPathResource(
                        path.replace("classpath:", ""));
        try (java.io.InputStream is = resource.getInputStream();
             java.io.BufferedReader reader =
                     new java.io.BufferedReader(new java.io.InputStreamReader(is))) {
            return reader.lines().collect(java.util.stream.Collectors.joining("\n"));
        }
    }

    private String stripPemHeaders(String pem) {
        return pem.lines()
                .filter(line -> !line.startsWith("-----"))
                .collect(java.util.stream.Collectors.joining());
    }
}
