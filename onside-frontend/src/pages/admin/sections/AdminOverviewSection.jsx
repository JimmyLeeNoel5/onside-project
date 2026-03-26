import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import useAuth from "../../../hooks/useAuth";
import styles from "../../dashboard/sections/DashSection.module.css";

export default function AdminOverviewSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.firstName || "Admin";

  useEffect(() => {
    async function fetchData() {
      try {
        const [clubsRes, eventsRes] = await Promise.all([
          axiosClient.get("/clubs/mine"),
          axiosClient.get("/events/my-registrations"),
        ]);
        setClubs(Array.isArray(clubsRes.data) ? clubsRes.data : []);
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      } catch {
        // silently ignore — stats will show 0
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    {
      label: "Clubs Managed",
      value: loading ? "—" : clubs.length,
      color: "#40916c",
    },
    {
      label: "Active Events",
      value: loading ? "—" : events.length,
      color: "#3b82f6",
    },
    {
      label: "Role",
      value: user?.roles?.includes("LEAGUE_ADMIN")
        ? "League Admin"
        : "Club Admin",
      color: "#f59e0b",
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>Good to see you, {firstName} 👋</div>
          <h1 className={styles.title}>Admin Overview</h1>
        </div>
        <button
          className={styles.primaryBtn}
          onClick={() => navigate("/events/new")}
        >
          + Create Event
        </button>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue} style={{ color: s.color }}>
              {s.value}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className={styles.card} style={{ marginTop: "2rem" }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Quick Actions</div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            padding: "0.5rem 0",
          }}
        >
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/events/new")}
          >
            + Create Event
          </button>
          <button
            className={styles.ghostBtn}
            onClick={() => navigate("/admin")}
          >
            Manage Teams
          </button>
          <button
            className={styles.ghostBtn}
            onClick={() => navigate("/admin")}
          >
            Manage Staff
          </button>
          <button
            className={styles.ghostBtn}
            onClick={() => navigate("/admin")}
          >
            View Registrations
          </button>
        </div>
      </div>

      {/* Clubs list */}
      {clubs.length > 0 && (
        <div className={styles.card} style={{ marginTop: "1.5rem" }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Your Clubs</div>
          </div>
          {clubs.map((c) => (
            <div key={c.id} className={styles.matchItem}>
              <div className={styles.matchInfo}>
                <div className={styles.matchOpponent}>{c.name}</div>
                <div className={styles.matchMeta}>
                  {c.city && c.state
                    ? `${c.city}, ${c.state}`
                    : "Location not set"}
                </div>
              </div>
              <div className={styles.matchChevron}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
