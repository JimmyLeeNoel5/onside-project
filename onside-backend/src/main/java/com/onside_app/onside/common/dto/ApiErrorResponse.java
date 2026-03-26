package com.onside_app.onside.common.dto;

import java.time.OffsetDateTime;

public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path,
        OffsetDateTime timestamp
) {
    public static ApiErrorResponse of(
            int status,
            String error,
            String message,
            String path) {
        return new ApiErrorResponse(status, error, message, path, OffsetDateTime.now());
    }
}
