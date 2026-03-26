import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import styles from "../../dashboard/sections/DashSection.module.css";

export default function StandingsSection() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        const res = await axiosClient.get("/leagues/mine");
        const data = Array.isArray(res.data) ? res.data : [];
        setLeagues(data);
        if (data.length > 0) setSelectedLeague(data[0]);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// League</div>
            <h1 className={styles.title}>Standings</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>// League</div>
          <h1 className={styles.title}>Standings</h1>
        </div>
      </div>

      {leagues.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No leagues found.</div>
        </div>
      ) : (
        <>
          {/* League selector */}
          {leagues.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              {leagues.map((l) => (
                <button
                  key={l.id}
                  className={
                    selectedLeague?.id === l.id
                      ? styles.primaryBtn
                      : styles.ghostBtn
                  }
                  onClick={() => setSelectedLeague(l)}
                >
                  {l.name}
                </button>
              ))}
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                {selectedLeague?.name} — Standings
              </div>
            </div>

            {/* Standings table header */}
            <div className={styles.rosterTable}>
              <div className={styles.rosterHead}>
                <span>#</span>
                <span>Team</span>
                <span>W</span>
                <span>L</span>
                <span>D</span>
                <span>Pts</span>
              </div>
              <div
                className={styles.emptyText}
                style={{ padding: "1.5rem 0", textAlign: "center" }}
              >
                Standings will populate once match results are recorded. Match
                result tracking is coming in a future release.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
