package com.onside_app.onside.common.util;

import java.text.Normalizer;
import java.util.Locale;

public final class SlugUtils {

    private SlugUtils() {}      // utility class — no instantiation

    /**
     * Converts a name to a URL-friendly slug.
     *
     * Examples:
     *   "USL Championship"      → "usl-championship"
     *   "Georgia Revolution"    → "georgia-revolution"
     *   "NPSL (Midwest Region)" → "npsl-midwest-region"
     *   "Atlanta FC U-17"       → "atlanta-fc-u-17"
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Cannot generate slug from blank input");
        }

        return Normalizer
                .normalize(input, Normalizer.Form.NFD)  // decompose accented chars
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "") // strip accents
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")        // remove non-alphanumeric
                .trim()
                .replaceAll("\\s+", "-")                // spaces to hyphens
                .replaceAll("-+", "-");                 // collapse multiple hyphens
    }

    /**
     * Generates a unique slug by appending a counter if the base slug exists.
     *
     * Examples:
     *   "usl-championship" exists → "usl-championship-2"
     *   "usl-championship-2" exists → "usl-championship-3"
     */
    public static String toUniqueSlug(String input,
                                      java.util.function.Predicate<String> exists) {
        String base = toSlug(input);
        String candidate = base;
        int counter = 2;

        while (exists.test(candidate)) {
            candidate = base + "-" + counter++;
        }

        return candidate;
    }
}