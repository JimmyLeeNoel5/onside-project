-- ── events ────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

SET search_path TO onside_app_dev, public;
CREATE TABLE events (
                        id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        name                    VARCHAR(200) NOT NULL,
                        slug                    VARCHAR(200) NOT NULL,
                        type                    event_type NOT NULL,
                        description             TEXT,
                        gender_category         gender_category,
                        skill_level             skill_level,

    -- Host (club or independent organizer)
                        host_club_id            UUID,
                        host_user_id            UUID,

    -- Location
                        venue_name              VARCHAR(255),
                        address_line1           VARCHAR(255),
                        address_line2           VARCHAR(255),
                        city                    VARCHAR(100),
                        state                   VARCHAR(2),
                        zip_code                VARCHAR(10),
                        coordinates             geography(Point, 4326),

    -- Schedule
                        start_date              DATE NOT NULL,
                        end_date                DATE,
                        start_time              TIME,
                        end_time                TIME,

    -- Registration window
                        registration_opens_at   TIMESTAMPTZ,
                        registration_closes_at  TIMESTAMPTZ,

    -- Capacity + waitlist
                        capacity                SMALLINT,
                        waitlist_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
                        waitlist_capacity       SMALLINT,

    -- Fees
                        individual_fee          NUMERIC(10,2),
                        team_fee                NUMERIC(10,2),
                        fee_currency            VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Registration type
                        allows_individual_reg   BOOLEAN NOT NULL DEFAULT TRUE,
                        allows_team_reg         BOOLEAN NOT NULL DEFAULT FALSE,

    -- League / season link (optional)
                        league_id               UUID,
                        season_id               UUID,

    -- Age restrictions
                        min_age                 SMALLINT,
                        max_age                 SMALLINT,

    -- Meta
                        image_url               VARCHAR(500),
                        website                 VARCHAR(255),
                        contact_email           VARCHAR(255),
                        contact_phone           VARCHAR(20),
                        is_published            BOOLEAN NOT NULL DEFAULT FALSE,
                        is_cancelled            BOOLEAN NOT NULL DEFAULT FALSE,
                        cancelled_reason        TEXT,
                        deleted_at              TIMESTAMPTZ,
                        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                        CONSTRAINT events_slug_key UNIQUE (slug),
                        CONSTRAINT fk_events_host_club    FOREIGN KEY (host_club_id)  REFERENCES clubs(id),
                        CONSTRAINT fk_events_host_user    FOREIGN KEY (host_user_id)  REFERENCES users(id),
                        CONSTRAINT fk_events_league       FOREIGN KEY (league_id)     REFERENCES leagues(id),
                        CONSTRAINT fk_events_season       FOREIGN KEY (season_id)     REFERENCES seasons(id)
);

-- ── event_team_registrations ──────────────────────────────────────────────────
-- Separate table for team-level registration (vs individual in event_registrations)
CREATE TABLE event_team_registrations (
                                          id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                          event_id            UUID NOT NULL,
                                          team_id             UUID NOT NULL,
                                          registered_by       UUID NOT NULL,  -- user who submitted the registration
                                          status              registration_status NOT NULL DEFAULT 'PENDING',
                                          payment_status      payment_status NOT NULL DEFAULT 'NOT_REQUIRED',
                                          registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                          confirmed_at        TIMESTAMPTZ,
                                          cancelled_at        TIMESTAMPTZ,
                                          cancellation_reason TEXT,
                                          notes               TEXT,
                                          created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                          updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                          CONSTRAINT fk_etr_event         FOREIGN KEY (event_id)        REFERENCES events(id),
                                          CONSTRAINT fk_etr_team          FOREIGN KEY (team_id)         REFERENCES teams(id),
                                          CONSTRAINT fk_etr_registered_by FOREIGN KEY (registered_by)   REFERENCES users(id),
                                          CONSTRAINT uq_etr_event_team    UNIQUE (event_id, team_id)
);

-- ── Add event FK to event_registrations ───────────────────────────────────────
ALTER TABLE event_registrations
    ADD CONSTRAINT fk_event_reg_event
        FOREIGN KEY (event_id) REFERENCES events(id);

-- ── Add event FK to saved_events ──────────────────────────────────────────────
ALTER TABLE saved_events
    ADD CONSTRAINT fk_saved_events_event
        FOREIGN KEY (event_id) REFERENCES events(id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_events_type           ON events(type);
CREATE INDEX idx_events_start_date     ON events(start_date);
CREATE INDEX idx_events_city_state     ON events(city, state);
CREATE INDEX idx_events_host_club      ON events(host_club_id);
CREATE INDEX idx_events_league         ON events(league_id);
CREATE INDEX idx_events_is_published   ON events(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_event_reg_user        ON event_registrations(user_id);
CREATE INDEX idx_event_reg_event       ON event_registrations(event_id);
CREATE INDEX idx_event_team_reg_event  ON event_team_registrations(event_id);
CREATE INDEX idx_saved_events_user     ON saved_events(user_id);