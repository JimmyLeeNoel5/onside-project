package com.onside_app.onside.event.dto;

import com.onside_app.onside.common.enums.PaymentStatus;
import com.onside_app.onside.common.enums.RegistrationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EventRegistrationResponse(
        UUID id,
        UUID eventId,
        String eventName,
        String eventSlug,
        UUID userId,
        RegistrationStatus status,
        PaymentStatus paymentStatus,
        Short waitlistPosition,
        String playerNotes,
        OffsetDateTime registeredAt,
        OffsetDateTime confirmedAt,
        OffsetDateTime cancelledAt
) {}