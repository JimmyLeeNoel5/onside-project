-- V3__league_type.sql
-- Adds a league_type column to the leagues table so leagues can be
-- categorized by their level of play (COLLEGE, YOUTH, INDOOR, etc.)
-- This enables the /find browse page to filter leagues by section.

-- Required for uuid_generate_v4() if used elsewhere in this migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

SET search_path TO onside_app_dev, public;

-- Step 1: Create the PostgreSQL ENUM type for league_type.
-- We use IF NOT EXISTS to make this migration safe to re-run.
CREATE TYPE league_type AS ENUM (
    'PROFESSIONAL',
    'COLLEGE',
    'HIGH_SCHOOL',
    'YOUTH',
    'INDOOR',
    'RECREATIONAL',
    'OTHER'
);

-- Step 2: Add the league_type column to the leagues table.
-- DEFAULT 'RECREATIONAL' so existing rows get a sensible value.
-- After running this migration, update existing leagues via the admin
-- API (PUT /leagues/:slug) to set the correct type for each.
ALTER TABLE onside_app_dev.leagues
    ADD COLUMN league_type league_type NOT NULL DEFAULT 'RECREATIONAL';