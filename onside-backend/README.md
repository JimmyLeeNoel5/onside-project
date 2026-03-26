# Onside

**Webapp for US soccer ecosystem**

Onside is a Spring Boot application designed to manage the US soccer ecosystem. It provides comprehensive backend services to handle users, clubs, leagues, events, and authentication.

## Tech Stack

*   **Java 21**
*   **Spring Boot 4.0.3**
    *   Spring Web MVC
    *   Spring Data JPA
    *   Spring Security
    *   Spring Boot Validation
    *   Spring Boot Mail (JavaMailSender)
*   **PostgreSQL** (Database)
*   **Flyway** (Database Migrations)
*   **JWT (JSON Web Tokens)** (Authentication & Authorization)
*   **Springdoc OpenAPI (Swagger)** (API Documentation)
*   **Lombok** (Boilerplate code reduction)
*   **MapStruct** (Java bean mappings)

## Core Modules

The application is structured around the following core domains:

*   **`auth`**: Handles user authentication, registration, and JWT token management.
*   **`users`**: Manages user profiles, roles, and details.
*   **`club`**: Handles the creation and management of soccer clubs.
*   **`league`**: Manages soccer leagues and related structures.
*   **`event`**: Manages matches, tournaments, or other soccer events.
*   **`request`**: Handles various requests such as club/league join requests.
*   **`config`**: Security, OpenAPI, and application-level configurations.
*   **`common`**: Shared utilities, exceptions, and base classes.

## Prerequisites

*   **Java Development Kit (JDK) 21**
*   **Maven**
*   **PostgreSQL** server running locally or remotely.

## Getting Started

### 1. Database Setup
Create a local PostgreSQL database for the application.
```sql
CREATE DATABASE onside;
```

Update your `src/main/resources/application.properties` (or `.yml`) with your PostgreSQL connection details and SMTP credentials for email support:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/onside
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

# Flyway config
spring.flyway.enabled=true
```

### 2. Building the Application
You can build the project using the Maven wrapper:
```bash
./mvnw clean install
```

### 3. Running the Application
Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```
By default, the application will run on `http://localhost:8080`.

## API Documentation
The application uses Springdoc OpenAPI to generate API documentation automatically.
Once the application is running, you can access the Swagger UI at:
*   [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) (or adjust the port based on your configuration)

## Database Migrations
This project uses **Flyway** for database versioning. Migration scripts are typically located in `src/main/resources/db/migration`. Flyway will automatically run the migrations on application startup.

## Security
The API is secured using Spring Security and JSON Web Tokens (JWT). 
1. Obtain a token by authenticating through the login endpoint (usually within `/auth`).
2. Include the token in the `Authorization` header as a Bearer token (`Authorization: Bearer <your_token>`) for subsequent requests to secured endpoints.