-- flyway:no-transaction
-- ============================================================
-- V4__league_type_update.sql
-- Adds SEMI_PRO and AMATEUR values to the league_type PostgreSQL enum
-- Note: must run without transaction because Postgres doesn't allow
-- adding and using enum values in the same transaction block.
-- ============================================================

-- 1. Add new values to the existing enum
-- Use IF NOT EXISTS to prevent errors on re-runs
ALTER TYPE onside_app_dev.league_type ADD VALUE IF NOT EXISTS 'SEMI_PRO';
ALTER TYPE onside_app_dev.league_type ADD VALUE IF NOT EXISTS 'AMATEUR';

-- 2. Update existing leagues to use 'PROFESSIONAL'
UPDATE onside_app_dev.leagues
SET league_type = 'PROFESSIONAL'
WHERE slug IN ('mls', 'nwsl', 'usl-championship', 'usl-league-one', 'mls-next-pro');

-- 3. Update existing leagues to use the newly added 'SEMI_PRO'
UPDATE onside_app_dev.leagues
SET league_type = 'SEMI_PRO'
WHERE slug IN ('usl-league-two', 'upsl-premier', 'usl-w-league');

-- 4. Update existing leagues to use 'YOUTH'
UPDATE onside_app_dev.leagues
SET league_type = 'YOUTH'
WHERE slug IN ('mls-next-academy');

-- 5. Verification logs (Optional: viewable in your Spring Boot console)
-- Check Enum values
SELECT enumlabel FROM pg_enum
                          JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'league_type'
ORDER BY enumsortorder;

-- Check Table data
SELECT name, slug, league_type FROM onside_app_dev.leagues ORDER BY name;