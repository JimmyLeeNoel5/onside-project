# Onside Project

This project is a web application for managing soccer leagues, teams, and events. It consists of a Spring Boot backend and a React frontend.

## Modules

### `onside-backend`

This is a Spring Boot application that provides the REST API for the Onside platform.

**Key Features:**

*   **Authentication:** JWT-based authentication and authorization.
*   **Club Management:** Create and manage clubs, including staff and teams.
*   **Team Management:** Manage team rosters and seasons.
*   **Event Management:** Create and manage events, including registration.
*   **League Management:** Create and manage leagues, conferences, divisions, and seasons.
*   **User Management:** User profiles and roles.

**Technologies:**

*   Java
*   Spring Boot
*   Spring Security
*   JPA (Hibernate)
*   PostgreSQL
*   Maven

### `onside-frontend`

This is a React application that provides the user interface for the Onside platform.

**Key Features:**

*   User authentication (login/register).
*   Browse leagues, teams, and events.
*   Create and manage clubs, teams, and events.
*   User dashboard for managing personal information and team memberships.
*   Admin dashboard for managing the platform.

**Technologies:**

*   React
*   React Router
*   Axios
*   Vite

## Getting Started

### Backend

1.  Navigate to the `onside-backend` directory.
2.  Configure the `application.properties` file with your database credentials.
3.  Run `mvn spring-boot:run`.

### Frontend

1.  Navigate to the `onside-frontend` directory.
2.  Run `npm install`.
3.  Run `npm run dev`.
