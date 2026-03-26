package com.onside_app.onside.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    /**
     * Configures Swagger UI to show the Authorize button and accept JWT tokens.
     *
     * How it works:
     * 1. We define a security scheme named "bearerAuth" — this tells Swagger
     *    that the API uses Bearer tokens in the Authorization header.
     * 2. We add a global SecurityRequirement that applies "bearerAuth" to all
     *    endpoints by default (individual public endpoints still work without it
     *    because Spring Security permits them regardless).
     * 3. Once added, Swagger UI shows the Authorize button (lock icon) at the top.
     *    You paste your JWT token there and Swagger adds "Authorization: Bearer <token>"
     *    to every request automatically.
     */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Onside API")
                        .description("US Soccer Ecosystem Platform")
                        .version("v1"))
                // Register the Bearer token security scheme
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")    // label only — tells Swagger this is a JWT
                                .description("Paste your access token here (without the 'Bearer ' prefix)")))
                // Apply bearerAuth globally to all endpoints in Swagger
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}