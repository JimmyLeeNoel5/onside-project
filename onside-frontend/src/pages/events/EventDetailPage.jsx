import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useAuthModal } from "../../context/AuthModalContext";
import axiosClient from "../../api/axiosClient";
import styles from "./EventDetailPage.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_CAN_CREATE = ["COACH", "CLUB_ADMIN", "LEAGUE_ADMIN"];

// Maps EventResponse.type (EventType enum) to readable labels
const EVENT_TYPE_LABELS = {
  GAME: "Game",
  TRYOUT: "Tryout",
  TOURNAMENT: "Tournament",
  ID_CAMP: "ID Camp",
  COMBINE: "Combine",
  PICKUP: "Pickup",
  OTHER: "Other",
};

// Maps EventResponse.genderCategory (GenderCategory enum) to readable labels
const GENDER_LABELS = {
  MALE: "Men's",
  FEMALE: "Women's",
  COED: "Co-ed",
  OPEN: "Open",
};

// ─────────────────────────────────────────────────────────────────────────────
// FIELD NAME MAPPING — EventResponse DTO vs what the frontend uses
//
//   Backend field       Frontend usage
//   ─────────────────   ──────────────────────────────
//   event.name          event title / heading
//   event.type          event type badge
//   event.venueName     location display
//   event.capacity      max capacity for spots logic
//   event.individualFee entry fee display
//   event.confirmedCount registered count for capacity bar
//   event.hostClubName  "Hosted by" line
//   event.startDate     LocalDate "2025-04-12" — combined with startTime for display
//   event.startTime     LocalTime "10:00:00"
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ label, variant = "default" }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>
      {label}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoIcon}>{icon}</span>
      <div className={styles.infoText}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin, openRegister } = useAuthModal();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const canCreate =
    user && ROLE_CAN_CREATE.some((r) => user.roles?.includes(r));
  const isLoggedIn = !!user;

  // Fetch event from GET /events/:slug (public endpoint)
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await axiosClient.get(`/events/${slug}`);
        setEvent(res.data);
      } catch {
        setError("Event not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [slug]);

  // Check if the logged-in user is already registered for this event
  useEffect(() => {
    if (!isLoggedIn || !event) return;
    async function checkRegistration() {
      try {
        const res = await axiosClient.get("/events/my-registrations");
        const regs = res.data || [];
        setRegistered(regs.some((r) => r.eventSlug === slug));
      } catch {
        // Non-critical — leave registered as false
      }
    }
    checkRegistration();
  }, [isLoggedIn, event, slug]);

  async function handleRegister() {
    if (!isLoggedIn) {
      openLogin({ returnTo: `/events/${slug}` });
      return;
    }
    setRegistering(true);
    setRegisterError(null);
    try {
      await axiosClient.post(`/events/${slug}/register`);
      setRegistered(true);
    } catch (err) {
      setRegisterError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setRegistering(false);
    }
  }

  async function handleCancelRegistration() {
    setRegistering(true);
    setRegisterError(null);
    try {
      await axiosClient.delete(`/events/${slug}/register`);
      setRegistered(false);
    } catch (err) {
      setRegisterError(
        err?.response?.data?.message || "Could not cancel registration.",
      );
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.errorWrap}>
        <h2>Event not found</h2>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          Back to Browse
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATE / TIME FORMATTING
  //
  // EventResponse uses separate LocalDate and LocalTime fields:
  //   startDate: "2025-04-12"   (LocalDate)
  //   startTime: "10:00:00"     (LocalTime)
  //
  // We combine them into a single Date object for formatting.
  // If startTime is null, we default to "00:00:00" so the Date is still valid.
  // ─────────────────────────────────────────────────────────────────────────

  const startDateTime = new Date(
    `${event.startDate}T${event.startTime || "00:00:00"}`,
  );
  const endDateTime = event.endDate
    ? new Date(`${event.endDate}T${event.endTime || "00:00:00"}`)
    : null;

  const formattedDate = startDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = event.startTime
    ? startDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const formattedEndTime =
    endDateTime && event.endTime
      ? endDateTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  // CAPACITY LOGIC
  //
  // EventResponse.capacity = max capacity (Short)
  // EventResponse.confirmedCount = number of confirmed registrations
  // ─────────────────────────────────────────────────────────────────────────

  const spotsLeft =
    event.capacity != null
      ? event.capacity - (event.confirmedCount || 0)
      : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isLow = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span>←</span> Browse Events
        </button>
        {canCreate && (
          <button
            className={styles.createBtn}
            onClick={() => navigate("/events/new")}
          >
            + Create Event
          </button>
        )}
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroBadges}>
            {/* event.type maps to EventType enum */}
            <Badge
              label={EVENT_TYPE_LABELS[event.type] || event.type}
              variant="type"
            />
            {/* event.genderCategory maps to GenderCategory enum */}
            {event.genderCategory && (
              <Badge
                label={
                  GENDER_LABELS[event.genderCategory] || event.genderCategory
                }
                variant="gender"
              />
            )}
            {event.skillLevel && (
              <Badge label={event.skillLevel} variant="skill" />
            )}
          </div>

          {/* event.name is the event title in EventResponse */}
          <h1 className={styles.eventTitle}>{event.name}</h1>

          <div className={styles.heroMeta}>
            {/* event.hostClubName replaces the old event.organizerName */}
            {event.hostClubName && (
              <span className={styles.organizer}>
                Hosted by <strong>{event.hostClubName}</strong>
              </span>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left column */}
          <div className={styles.main}>
            {event.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About this event</h2>
                <p className={styles.description}>{event.description}</p>
              </section>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Event Details</h2>
              <div className={styles.infoGrid}>
                <InfoRow icon="📅" label="Date" value={formattedDate} />

                {/* Only show time row if startTime exists */}
                {formattedTime && (
                  <InfoRow
                    icon="🕐"
                    label="Time"
                    value={
                      formattedEndTime
                        ? `${formattedTime} – ${formattedEndTime}`
                        : formattedTime
                    }
                  />
                )}

                {/* event.venueName replaces the old event.location */}
                {event.venueName && (
                  <InfoRow icon="📍" label="Venue" value={event.venueName} />
                )}

                {event.city && event.state && (
                  <InfoRow
                    icon="🗺️"
                    label="Area"
                    value={`${event.city}, ${event.state}`}
                  />
                )}

                {/* event.capacity replaces the old event.maxCapacity */}
                {/* event.confirmedCount replaces the old event.registrationCount */}
                {event.capacity != null && (
                  <InfoRow
                    icon="👥"
                    label="Capacity"
                    value={
                      isFull
                        ? "Full"
                        : `${event.confirmedCount || 0} / ${event.capacity} registered`
                    }
                  />
                )}

                {/* event.individualFee replaces the old event.entryFee */}
                {event.individualFee != null && event.individualFee > 0 && (
                  <InfoRow
                    icon="💵"
                    label="Entry Fee"
                    value={`$${event.individualFee}`}
                  />
                )}
                {(event.individualFee === 0 || event.individualFee == null) && (
                  <InfoRow icon="💵" label="Entry Fee" value="Free" />
                )}
              </div>
            </section>
          </div>

          {/* Right column — sticky registration card */}
          <aside className={styles.sidebar}>
            <div className={styles.registerCard}>
              {/* Capacity bar */}
              {spotsLeft !== null && (
                <div className={styles.capacityBar}>
                  <div className={styles.capacityBarTrack}>
                    <div
                      className={styles.capacityBarFill}
                      style={{
                        width: `${Math.min(100, ((event.confirmedCount || 0) / event.capacity) * 100)}%`,
                        background: isFull
                          ? "#e63946"
                          : isLow
                            ? "#f4a261"
                            : "#40916c",
                      }}
                    />
                  </div>
                  <p
                    className={styles.capacityLabel}
                    style={{
                      color: isFull ? "#e63946" : isLow ? "#f4a261" : "#40916c",
                    }}
                  >
                    {isFull
                      ? "Event is full"
                      : isLow
                        ? `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left!`
                        : `${spotsLeft} spots remaining`}
                  </p>
                </div>
              )}

              {/* CTA: 3 states — unauthenticated / registered / not registered */}
              {!isLoggedIn ? (
                <div className={styles.authPrompt}>
                  <p>You need an account to register for events.</p>
                  <button className={styles.registerBtn} onClick={openLogin}>
                    Sign In to Register
                  </button>
                  <button
                    className={styles.createAccountBtn}
                    onClick={openRegister}
                  >
                    Create an Account
                  </button>
                </div>
              ) : registered ? (
                <div className={styles.registeredState}>
                  <div className={styles.registeredBadge}>
                    You're registered
                  </div>
                  <button
                    className={styles.cancelRegBtn}
                    onClick={handleCancelRegistration}
                    disabled={registering}
                  >
                    {registering ? "Cancelling..." : "Cancel Registration"}
                  </button>
                </div>
              ) : (
                <button
                  className={styles.registerBtn}
                  onClick={handleRegister}
                  disabled={registering || isFull}
                >
                  {registering
                    ? "Registering..."
                    : isFull
                      ? "Event Full"
                      : "Register Now"}
                </button>
              )}

              {registerError && (
                <p className={styles.registerError}>{registerError}</p>
              )}

              {/* Quick summary at the bottom of the card */}
              <div className={styles.cardMeta}>
                <div className={styles.cardMetaRow}>
                  <span>📅</span>
                  <span>{formattedDate}</span>
                </div>
                {formattedTime && (
                  <div className={styles.cardMetaRow}>
                    <span>🕐</span>
                    <span>{formattedTime}</span>
                  </div>
                )}
                {event.venueName && (
                  <div className={styles.cardMetaRow}>
                    <span>📍</span>
                    <span>{event.venueName}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
