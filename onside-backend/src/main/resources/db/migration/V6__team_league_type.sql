-- ============================================================
-- V6__team_league_type.sql
-- Adds league_type column to teams table (nullable).
-- Teams can exist independently of any league season.
-- ============================================================

ALTER TABLE onside_app_dev.teams
    ADD COLUMN IF NOT EXISTS league_type league_type NULL;
