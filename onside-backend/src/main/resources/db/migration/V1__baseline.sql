-- ── Extensions ────────────────────────────────────────────────────────────────
SET search_path TO onside_app_dev, public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ── ENUMs ─────────────────────────────────────────────────────────────────────
CREATE TYPE auth_provider AS ENUM ('LOCAL','GOOGLE','APPLE');

CREATE TYPE club_staff_role AS ENUM (
    'OWNER','ADMIN','MANAGER','COACH','ASSISTANT_COACH','MEDIA'
);

CREATE TYPE dominant_foot AS ENUM ('LEFT','RIGHT','BOTH');

CREATE TYPE event_type AS ENUM (
    'GAME','TRYOUT','TOURNAMENT','ID_CAMP','COMBINE','PICKUP','OTHER'
);

CREATE TYPE gender_category AS ENUM (
    'MEN','WOMEN','YOUTH_BOYS','YOUTH_GIRLS'
);

CREATE TYPE payment_status AS ENUM (
    'NOT_REQUIRED','PENDING','PAID','REFUNDED'
);

CREATE TYPE player_position AS ENUM (
    'GOALKEEPER','DEFENDER','MIDFIELDER','FORWARD','UTILITY'
);

CREATE TYPE registration_status AS ENUM (
    'PENDING','CONFIRMED','WAITLISTED','CANCELLED'
);

CREATE TYPE skill_level AS ENUM (
    'BEGINNER','RECREATIONAL','INTERMEDIATE','ADVANCED','ELITE'
);

CREATE TYPE team_roster_role AS ENUM (
    'PLAYER','CAPTAIN','GOALKEEPER','COACH','ASSISTANT_COACH',
    'GOALKEEPER_COACH','PHYSIO','TEAM_MANAGER'
);

CREATE TYPE user_role AS ENUM (
    'BASIC_USER','COACH','TEAM_MANAGER','LEAGUE_ADMIN','SUPER_ADMIN'
);

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE users (
                       id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       email               VARCHAR(255) NOT NULL,
                       password_hash       VARCHAR(255),
                       auth_provider       auth_provider NOT NULL DEFAULT 'LOCAL',
                       provider_id         VARCHAR(255),
                       is_active           BOOLEAN NOT NULL DEFAULT TRUE,
                       is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
                       email_verified_at   TIMESTAMPTZ,
                       last_login_at       TIMESTAMPTZ,
                       created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       deleted_at          TIMESTAMPTZ,
                       CONSTRAINT uq_users_email UNIQUE (email)
);

-- ── user_roles ────────────────────────────────────────────────────────────────
CREATE TABLE user_roles (
                            id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            user_id      UUID NOT NULL,
                            role         user_role NOT NULL,
                            context_type VARCHAR(50),
                            context_id   UUID,
                            granted_by   UUID,
                            granted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            revoked_at   TIMESTAMPTZ,
                            CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
                            CONSTRAINT uq_user_role_per_context UNIQUE (user_id, role, context_type, context_id)
);

-- ── user_profiles ─────────────────────────────────────────────────────────────
CREATE TABLE user_profiles (
                               id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               user_id                 UUID NOT NULL,
                               first_name              VARCHAR(100),
                               last_name               VARCHAR(100),
                               date_of_birth           DATE,
                               phone                   VARCHAR(20),
                               avatar_url              TEXT,
                               bio                     TEXT,
                               primary_position        player_position,
                               secondary_position      player_position,
                               skill_level             skill_level,
                               dominant_foot           dominant_foot,
                               preferred_gender_cat    gender_category,
                               jersey_number           SMALLINT,
                               city                    VARCHAR(100),
                               state                   VARCHAR(2),
                               zip_code                VARCHAR(10),
                               coordinates             geography(Point, 4326),
                               instagram_url           TEXT,
                               twitter_url             TEXT,
                               tiktok_url              TEXT,
                               youtube_url             TEXT,
                               personal_website_url    TEXT,
                               receive_email_alerts    BOOLEAN NOT NULL DEFAULT TRUE,
                               receive_sms_alerts      BOOLEAN NOT NULL DEFAULT FALSE,
                               profile_is_public       BOOLEAN NOT NULL DEFAULT TRUE,
                               created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                               updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                               deleted_at              TIMESTAMPTZ,
                               CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id),
                               CONSTRAINT uq_user_profiles_user_id UNIQUE (user_id)
);

-- ── user_profile_levels ───────────────────────────────────────────────────────
CREATE TABLE user_profile_levels (
                                     id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                     user_profile_id   UUID NOT NULL,
                                     level_name        VARCHAR(100) NOT NULL,
                                     CONSTRAINT fk_upl_profile FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id),
                                     CONSTRAINT uq_upl_profile_level UNIQUE (user_profile_id, level_name)
);

-- ── refresh_tokens ────────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
                                id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                user_id      UUID NOT NULL,
                                token_hash   VARCHAR(255) NOT NULL,
                                device_info  TEXT,
                                ip_address   INET,
                                issued_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                expires_at   TIMESTAMPTZ NOT NULL,
                                revoked_at   TIMESTAMPTZ,
                                CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id),
                                CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash)
);

-- ── email_verification_tokens ─────────────────────────────────────────────────
CREATE TABLE email_verification_tokens (
                                           id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                           user_id      UUID NOT NULL,
                                           token_hash   VARCHAR(255) NOT NULL,
                                           expires_at   TIMESTAMPTZ NOT NULL,
                                           used_at      TIMESTAMPTZ,
                                           CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users(id),
                                           CONSTRAINT uq_evt_token_hash UNIQUE (token_hash)
);

-- ── password_reset_tokens ─────────────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
                                       id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                       user_id      UUID NOT NULL,
                                       token_hash   VARCHAR(255) NOT NULL,
                                       expires_at   TIMESTAMPTZ NOT NULL,
                                       used_at      TIMESTAMPTZ,
                                       CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id),
                                       CONSTRAINT uq_prt_token_hash UNIQUE (token_hash)
);

-- ── leagues ───────────────────────────────────────────────────────────────────
CREATE TABLE leagues (
                         id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                         name            VARCHAR(150) NOT NULL,
                         short_name      VARCHAR(30),
                         slug            VARCHAR(150) NOT NULL,
                         gender_category gender_category,
                         skill_level     skill_level,
                         description     TEXT,
                         founded_year    SMALLINT,
                         website         VARCHAR(255),
                         logo_url        VARCHAR(500),
                         is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                         created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                         updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                         CONSTRAINT leagues_slug_key UNIQUE (slug)
);

-- ── conferences ───────────────────────────────────────────────────────────────
CREATE TABLE conferences (
                             id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             league_id   UUID NOT NULL,
                             name        VARCHAR(150) NOT NULL,
                             short_name  VARCHAR(30),
                             slug        VARCHAR(150) NOT NULL,
                             region      VARCHAR(100),
                             is_active   BOOLEAN NOT NULL DEFAULT TRUE,
                             created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             CONSTRAINT conferences_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id),
                             CONSTRAINT uq_conferences_league_slug UNIQUE (league_id, slug)
);

-- ── divisions ─────────────────────────────────────────────────────────────────
CREATE TABLE divisions (
                           id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           conference_id   UUID NOT NULL,
                           name            VARCHAR(150) NOT NULL,
                           short_name      VARCHAR(30),
                           slug            VARCHAR(150) NOT NULL,
                           is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                           created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                           updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                           CONSTRAINT divisions_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES conferences(id),
                           CONSTRAINT uq_divisions_conference_slug UNIQUE (conference_id, slug)
);

-- ── seasons ───────────────────────────────────────────────────────────────────
CREATE TABLE seasons (
                         id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                         league_id   UUID NOT NULL,
                         name        VARCHAR(100) NOT NULL,
                         year        SMALLINT NOT NULL,
                         start_date  DATE,
                         end_date    DATE,
                         is_active   BOOLEAN NOT NULL DEFAULT TRUE,
                         is_current  BOOLEAN NOT NULL DEFAULT FALSE,
                         created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                         updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                         CONSTRAINT seasons_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id),
                         CONSTRAINT uq_seasons_league_name UNIQUE (league_id, name)
);

-- ── clubs ─────────────────────────────────────────────────────────────────────
CREATE TABLE clubs (
                       id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       name            VARCHAR(150) NOT NULL,
                       short_name      VARCHAR(50),
                       slug            VARCHAR(150) NOT NULL,
                       description     TEXT,
                       city            VARCHAR(100),
                       state           VARCHAR(2),
                       founded_year    SMALLINT,
                       website         VARCHAR(255),
                       logo_url        VARCHAR(500),
                       banner_url      VARCHAR(500),
                       is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                       is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
                       deleted_at      TIMESTAMPTZ,
                       created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       CONSTRAINT clubs_slug_key UNIQUE (slug)
);

-- ── club_staff ────────────────────────────────────────────────────────────────
CREATE TABLE club_staff (
                            id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            club_id     UUID NOT NULL,
                            user_id     UUID NOT NULL,
                            role        club_staff_role NOT NULL,
                            is_active   BOOLEAN NOT NULL DEFAULT TRUE,
                            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            revoked_at  TIMESTAMPTZ,
                            CONSTRAINT club_staff_club_id_fkey FOREIGN KEY (club_id) REFERENCES clubs(id),
                            CONSTRAINT club_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
                            CONSTRAINT uq_club_staff_user_role UNIQUE (club_id, user_id, role)
);

-- ── teams ─────────────────────────────────────────────────────────────────────
CREATE TABLE teams (
                       id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       club_id         UUID NOT NULL,
                       name            VARCHAR(150) NOT NULL,
                       short_name      VARCHAR(50),
                       slug            VARCHAR(150) NOT NULL,
                       gender_category gender_category,
                       skill_level     skill_level,
                       city            VARCHAR(100),
                       state           VARCHAR(2),
                       logo_url        VARCHAR(500),
                       primary_color   VARCHAR(7),
                       secondary_color VARCHAR(7),
                       description     TEXT,
                       home_venue      VARCHAR(255),
                       is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                       is_recruiting   BOOLEAN NOT NULL DEFAULT FALSE,
                       deleted_at      TIMESTAMPTZ,
                       created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       CONSTRAINT teams_club_id_fkey FOREIGN KEY (club_id) REFERENCES clubs(id),
                       CONSTRAINT uq_teams_club_slug UNIQUE (club_id, slug)
);

-- ── team_roster ───────────────────────────────────────────────────────────────
CREATE TABLE team_roster (
                             id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             team_id         UUID NOT NULL,
                             user_id         UUID NOT NULL,
                             role            team_roster_role NOT NULL DEFAULT 'PLAYER',
                             position        player_position,
                             jersey_number   SMALLINT,
                             joined_at       DATE,
                             left_at         DATE,
                             is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                             created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             CONSTRAINT team_roster_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id),
                             CONSTRAINT team_roster_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── season_teams ──────────────────────────────────────────────────────────────
CREATE TABLE season_teams (
                              id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              season_id       UUID NOT NULL,
                              team_id         UUID NOT NULL,
                              conference_id   UUID,
                              division_id     UUID,
                              is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                              created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                              updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                              CONSTRAINT season_teams_season_id_fkey  FOREIGN KEY (season_id)     REFERENCES seasons(id),
                              CONSTRAINT season_teams_team_id_fkey    FOREIGN KEY (team_id)       REFERENCES teams(id),
                              CONSTRAINT season_teams_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES conferences(id),
                              CONSTRAINT season_teams_division_id_fkey   FOREIGN KEY (division_id)   REFERENCES divisions(id),
                              CONSTRAINT uq_season_teams_season_team UNIQUE (season_id, team_id)
);

-- ── event_registrations ───────────────────────────────────────────────────────
CREATE TABLE event_registrations (
                                     id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                     user_id             UUID NOT NULL,
                                     event_id            UUID NOT NULL,
                                     status              registration_status NOT NULL DEFAULT 'PENDING',
                                     payment_status      payment_status NOT NULL DEFAULT 'NOT_REQUIRED',
                                     registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                     confirmed_at        TIMESTAMPTZ,
                                     cancelled_at        TIMESTAMPTZ,
                                     cancellation_reason TEXT,
                                     waitlist_position   SMALLINT,
                                     player_notes        TEXT,
                                     created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                     updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                     CONSTRAINT fk_event_reg_user FOREIGN KEY (user_id) REFERENCES users(id),
                                     CONSTRAINT uq_event_reg_user_event UNIQUE (user_id, event_id)
);

-- ── saved_events ──────────────────────────────────────────────────────────────
CREATE TABLE saved_events (
                              id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              user_id     UUID NOT NULL,
                              event_id    UUID NOT NULL,
                              saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                              CONSTRAINT fk_saved_events_user FOREIGN KEY (user_id) REFERENCES users(id),
                              CONSTRAINT uq_saved_events_user_event UNIQUE (user_id, event_id)
);

-- ── coaching_session_bookings ─────────────────────────────────────────────────
CREATE TABLE coaching_session_bookings (
                                           id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                           student_user_id     UUID NOT NULL,
                                           coaching_session_id UUID NOT NULL,
                                           status              registration_status NOT NULL DEFAULT 'PENDING',
                                           payment_status      payment_status NOT NULL DEFAULT 'NOT_REQUIRED',
                                           booked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                           confirmed_at        TIMESTAMPTZ,
                                           cancelled_at        TIMESTAMPTZ,
                                           cancellation_reason TEXT,
                                           notes               TEXT,
                                           created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                           updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                           CONSTRAINT fk_csb_student FOREIGN KEY (student_user_id) REFERENCES users(id),
                                           CONSTRAINT uq_csb_student_session UNIQUE (student_user_id, coaching_session_id)
);

-- ── v_user_dashboard_summary (view) ──────────────────────────────────────────
CREATE OR REPLACE VIEW v_user_dashboard_summary AS
SELECT
    u.id                                                        AS user_id,
    up.first_name,
    up.last_name,
    up.avatar_url,
    COUNT(DISTINCT er.id) FILTER (WHERE er.status = 'CONFIRMED') AS upcoming_registrations,
    COUNT(DISTINCT er.id) FILTER (WHERE er.status = 'WAITLISTED') AS waitlisted_count,
    COUNT(DISTINCT er.id) FILTER (WHERE er.status = 'CANCELLED')  AS cancelled_count,
    COUNT(DISTINCT se.id)                                          AS saved_events_count,
    COUNT(DISTINCT csb.id) FILTER (WHERE csb.status = 'CONFIRMED') AS upcoming_coaching_sessions
FROM users u
         LEFT JOIN user_profiles up         ON up.user_id = u.id
         LEFT JOIN event_registrations er   ON er.user_id = u.id
         LEFT JOIN saved_events se          ON se.user_id = u.id
         LEFT JOIN coaching_session_bookings csb ON csb.student_user_id = u.id
GROUP BY u.id, up.first_name, up.last_name, up.avatar_url;