-- ============================================================
-- V5__league_type_update.sql
-- Updates existing leagues to use correct league_type classification.
-- Runs after V4 which committed the new enum values.
-- ============================================================

UPDATE onside_app_dev.leagues SET league_type = 'PROFESSIONAL' WHERE slug IN (
                                                                              'mls', 'nwsl', 'usl-championship', 'usl-league-one', 'mls-next-pro'
    );

UPDATE onside_app_dev.leagues SET league_type = 'SEMI_PRO' WHERE slug IN (
                                                                          'usl-league-two', 'upsl-premier', 'usl-w-league'
    );

UPDATE onside_app_dev.leagues SET league_type = 'YOUTH' WHERE slug = 'mls-next-academy';

-- Verify
SELECT name, slug, league_type FROM onside_app_dev.leagues ORDER BY name;