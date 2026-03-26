import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "../../dashboard/sections/DashSection.module.css";

const EVENT_TYPE_LABEL = {
  GAME: "Game",
  TRYOUT: "Tryout",
  TOURNAMENT: "Tournament",
  ID_CAMP: "ID Camp",
  COMBINE: "Combine",
  PICKUP: "Pickup",
  OTHER: "Other",
};

export default function ManageEventsSection() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Fetch all published events — admin sees all events they created
        const res = await axiosClient.get("/events");
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  async function handlePublish(slug) {
    try {
      await axiosClient.patch(`/events/${slug}/publish`);
      setEvents((prev) =>
        prev.map((e) => (e.slug === slug ? { ...e, isPublished: true } : e)),
      );
    } catch {}
  }

  async function handleCancel(slug) {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await axiosClient.patch(`/events/${slug}/cancel`);
      setEvents((prev) =>
        prev.map((e) => (e.slug === slug ? { ...e, isCancelled: true } : e)),
      );
    } catch {}
  }

  async function handleDelete(slug) {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    try {
      await axiosClient.delete(`/events/${slug}`);
      setEvents((prev) => prev.filter((e) => e.slug !== slug));
    } catch {}
  }

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Events</div>
            <h1 className={styles.title}>Manage Events</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>// Events</div>
          <h1 className={styles.title}>Manage Events</h1>
        </div>
        <button
          className={styles.primaryBtn}
          onClick={() => navigate("/events/new")}
        >
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <div className={styles.emptyText}>
            No events yet. Create your first event.
          </div>
          <button
            className={styles.primaryBtn}
            style={{ marginTop: "1rem" }}
            onClick={() => navigate("/events/new")}
          >
            + Create Event
          </button>
        </div>
      ) : (
        <div className={styles.leagueList}>
          {events.map((e) => {
            const typeLabel = EVENT_TYPE_LABEL[e.type] || e.type || "";
            const startDate = e.startDate
              ? new Date(
                  `${e.startDate}T${e.startTime || "00:00:00"}`,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—";
            const statusColor = e.isCancelled
              ? "#e63946"
              : e.isPublished
                ? "#40916c"
                : "#f59e0b";
            const statusLabel = e.isCancelled
              ? "Cancelled"
              : e.isPublished
                ? "Published"
                : "Draft";

            return (
              <div key={e.id} className={styles.leagueCard}>
                <div className={styles.leagueTop}>
                  <div className={styles.leagueLogo}>📅</div>
                  <div className={styles.leagueInfo}>
                    <div className={styles.leagueName}>{e.name}</div>
                    <div className={styles.leagueDivision}>
                      {typeLabel} · {startDate} · {e.venueName || "Venue TBD"}
                    </div>
                  </div>
                  <span
                    className={styles.statusPill}
                    style={{
                      color: statusColor,
                      borderColor: statusColor + "40",
                      background: statusColor + "12",
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className={styles.leagueDivider} />

                <div className={styles.leagueStats}>
                  <div className={styles.leagueStat}>
                    <div className={styles.leagueStatVal}>
                      {e.confirmedCount || 0}
                    </div>
                    <div className={styles.leagueStatLabel}>Registered</div>
                  </div>
                  <div className={styles.leagueStat}>
                    <div className={styles.leagueStatVal}>
                      {e.capacity || "∞"}
                    </div>
                    <div className={styles.leagueStatLabel}>Capacity</div>
                  </div>
                  <div className={styles.leagueStat}>
                    <div className={styles.leagueStatVal}>
                      {e.individualFee ? `$${e.individualFee}` : "Free"}
                    </div>
                    <div className={styles.leagueStatLabel}>Fee</div>
                  </div>
                </div>

                <div className={styles.leagueFooter}>
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    <button
                      className={styles.ghostBtn}
                      onClick={() => navigate(`/events/${e.slug}`)}
                    >
                      View →
                    </button>
                    {!e.isPublished && !e.isCancelled && (
                      <button
                        className={styles.primaryBtn}
                        style={{
                          padding: "0.4rem 0.85rem",
                          fontSize: "0.82rem",
                        }}
                        onClick={() => handlePublish(e.slug)}
                      >
                        Publish
                      </button>
                    )}
                    {!e.isCancelled && (
                      <button
                        className={styles.ghostBtn}
                        style={{
                          color: "#e63946",
                          borderColor: "rgba(230,57,70,0.3)",
                        }}
                        onClick={() => handleCancel(e.slug)}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      className={styles.ghostBtn}
                      style={{
                        color: "#e63946",
                        borderColor: "rgba(230,57,70,0.3)",
                      }}
                      onClick={() => handleDelete(e.slug)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
