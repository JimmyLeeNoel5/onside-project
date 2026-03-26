import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import styles from "../../dashboard/sections/DashSection.module.css";

export default function EventRegistrationsSection() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axiosClient.get("/events");
        const data = Array.isArray(res.data) ? res.data : [];
        setEvents(data);
        if (data.length > 0) setSelectedEvent(data[0]);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    async function fetchRegistrations() {
      setLoadingRegs(true);
      try {
        const res = await axiosClient.get(
          `/events/${selectedEvent.slug}/registrations`,
        );
        setRegistrations(Array.isArray(res.data) ? res.data : []);
      } catch {
        setRegistrations([]);
      } finally {
        setLoadingRegs(false);
      }
    }
    fetchRegistrations();
  }, [selectedEvent]);

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Events</div>
            <h1 className={styles.title}>Registrations</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading...</div>
        </div>
      </div>
    );
  }

  const confirmed = registrations.filter((r) => r.status === "CONFIRMED");
  const waitlisted = registrations.filter((r) => r.status === "WAITLISTED");

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>// Events</div>
          <h1 className={styles.title}>Registrations</h1>
        </div>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyText}>No events found.</div>
        </div>
      ) : (
        <>
          {/* Event selector */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {events.map((e) => (
              <button
                key={e.id}
                className={
                  selectedEvent?.id === e.id
                    ? styles.primaryBtn
                    : styles.ghostBtn
                }
                onClick={() => setSelectedEvent(e)}
              >
                {e.name}
              </button>
            ))}
          </div>

          {/* Stats */}
          {selectedEvent && (
            <div
              className={styles.statsGrid}
              style={{ marginBottom: "1.5rem" }}
            >
              <div className={styles.statCard}>
                <div className={styles.statValue} style={{ color: "#40916c" }}>
                  {confirmed.length}
                </div>
                <div className={styles.statLabel}>Confirmed</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue} style={{ color: "#f59e0b" }}>
                  {waitlisted.length}
                </div>
                <div className={styles.statLabel}>Waitlisted</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue} style={{ color: "#64748b" }}>
                  {selectedEvent.capacity || "∞"}
                </div>
                <div className={styles.statLabel}>Capacity</div>
              </div>
            </div>
          )}

          {/* Registrations table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                {selectedEvent?.name} — Registrations
              </div>
            </div>
            {loadingRegs ? (
              <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
                Loading registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
                No registrations yet for this event.
              </div>
            ) : (
              <div className={styles.rosterTable}>
                <div className={styles.rosterHead}>
                  <span>Name</span>
                  <span>Status</span>
                  <span>Payment</span>
                  <span>Registered</span>
                </div>
                {registrations.map((r, i) => {
                  const statusColor =
                    r.status === "CONFIRMED"
                      ? "#40916c"
                      : r.status === "WAITLISTED"
                        ? "#f59e0b"
                        : "#94a3b8";
                  const registeredAt = r.registeredAt
                    ? new Date(r.registeredAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—";
                  return (
                    <div key={r.id || i} className={styles.rosterRow}>
                      <span className={styles.rosterName}>
                        {r.firstName} {r.lastName}
                      </span>
                      <span
                        className={styles.rosterPos}
                        style={{ color: statusColor }}
                      >
                        {r.status}
                      </span>
                      <span className={styles.rosterPos}>
                        {r.paymentStatus || "—"}
                      </span>
                      <span className={styles.rosterPos}>{registeredAt}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
