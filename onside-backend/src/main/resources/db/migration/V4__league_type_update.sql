-- ============================================================
-- V4__league_type_add_values.sql
-- Adds SEMI_PRO and AMATEUR to the league_type enum.
-- MUST be a separate migration from V5 which uses these values.
-- PostgreSQL requires new enum values to be committed before use.
-- ============================================================

ALTER TYPE onside_app_dev.league_type ADD VALUE IF NOT EXISTS 'SEMI_PRO';
ALTER TYPE onside_app_dev.league_type ADD VALUE IF NOT EXISTS 'AMATEUR';