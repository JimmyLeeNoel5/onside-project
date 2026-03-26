import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./DashSection.module.css";

const GENDER_LABEL = {
  MALE: "Men's",
  FEMALE: "Women's",
  COED: "Co-Ed",
  OPEN: "Open",
};
const LEVEL_LABEL = {
  RECREATIONAL: "Recreational",
  COMPETITIVE: "Competitive",
  INTERMEDIATE: "Intermediate",
  SEMI_PRO: "Semi-Pro",
  PROFESSIONAL: "Professional",
  ELITE: "Elite",
};
const LEVEL_EMOJI = {
  PROFESSIONAL: "🏆",
  ELITE: "⭐",
  COMPETITIVE: "🥇",
  SEMI_PRO: "🥈",
  INTERMEDIATE: "⚡",
  RECREATIONAL: "⚽",
};

export default function MyLeaguesSection() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Now calls GET /leagues/mine — returns only leagues the logged-in user
  // is a member of (via TeamRoster → Team → SeasonTeam → Season → League).
  // Previously called GET /leagues which returned ALL leagues.
  useEffect(() => {
    async function fetchLeagues() {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get("/leagues/mine");
        setLeagues(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Failed to load leagues.");
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
            <div className={styles.greeting}>// Leagues</div>
            <h1 className={styles.title}>My Leagues</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading leagues...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Leagues</div>
            <h1 className={styles.title}>My Leagues</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <div className={styles.emptyText}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>// Leagues</div>
          <h1 className={styles.title}>My Leagues</h1>
        </div>
        <button
          className={styles.primaryBtn}
          onClick={() => navigate("/find", { state: { section: "leagues" } })}
        >
          + Join a League
        </button>
      </div>

      {leagues.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <div className={styles.emptyText}>
            You haven't joined any leagues yet.
          </div>
        </div>
      ) : (
        <div className={styles.leagueList}>
          {leagues.map((l) => {
            const genderLabel =
              GENDER_LABEL[l.genderCategory] || l.genderCategory || "";
            const levelLabel = LEVEL_LABEL[l.skillLevel] || l.skillLevel || "";
            const emoji = LEVEL_EMOJI[l.skillLevel] || "🏆";
            const statusColor = l.isActive ? "#40916c" : "#94a3b8";

            return (
              <div key={l.id} className={styles.leagueCard}>
                <div className={styles.leagueTop}>
                  <div className={styles.leagueLogo}>{emoji}</div>
                  <div className={styles.leagueInfo}>
                    <div className={styles.leagueName}>{l.name}</div>
                    <div className={styles.leagueDivision}>
                      {[levelLabel, genderLabel].filter(Boolean).join(" · ")}
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
                    {l.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className={styles.leagueDivider} />

                <div className={styles.leagueStats}>
                  <div className={styles.leagueStat}>
                    <div className={styles.leagueStatVal}>
                      {levelLabel || "—"}
                    </div>
                    <div className={styles.leagueStatLabel}>Level</div>
                  </div>
                  <div className={styles.leagueStat}>
                    <div className={styles.leagueStatVal}>
                      {genderLabel || "—"}
                    </div>
                    <div className={styles.leagueStatLabel}>Gender</div>
                  </div>
                  <div className={styles.leagueStat}>
                    <div
                      className={styles.leagueStatVal}
                      style={{ fontSize: "0.8rem", color: "#64748b" }}
                    >
                      {l.foundedYear ?? "—"}
                    </div>
                    <div className={styles.leagueStatLabel}>Founded</div>
                  </div>
                </div>

                <div className={styles.leagueFooter}>
                  <span className={styles.seasonTag}>{levelLabel}</span>
                  <button
                    className={styles.ghostBtn}
                    onClick={() => navigate(`/leagues/${l.slug}`)}
                  >
                    View League →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
