package com.onside_app.onside.common.enums;

/**
 * LeagueType — categorizes leagues by the level of play they represent.
 *
 * Used to filter leagues on the /find browse page so each sidebar section
 * (College, High School, Youth, etc.) only shows relevant leagues.
 *
 * Stored as a PostgreSQL named ENUM via @JdbcTypeCode(SqlTypes.NAMED_ENUM).
 * The Flyway migration V3__league_type.sql creates the DB type and adds
 * the column to the leagues table.
 */
public enum LeagueType {
    PROFESSIONAL,   // MLS, NWSL, USL Championship etc.
    SEMI_PRO,       // USL League One, USL League Two, UPSL etc.
    AMATEUR,        // Competitive amateur, USASA etc.
    RECREATIONAL,   // Adult rec/Sunday/social leagues
    COLLEGE,        // NCAA D1/D2/D3, NAIA, club college
    HIGH_SCHOOL,    // State associations, HS leagues
    YOUTH,          // U6 through U18 club/recreational
    INDOOR,         // Futsal, indoor soccer, 5-a-side
    OTHER
}