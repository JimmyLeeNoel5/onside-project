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

const GENDER_EMOJI = {
  MALE: "🔵",
  FEMALE: "🟣",
  COED: "🔴",
  OPEN: "🟢",
};

export default function MyTeamsSection() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Step 1: GET /clubs/mine → GET /clubs/{slug}/teams for each club
  useEffect(() => {
    async function fetchMyTeams() {
      setLoadingTeams(true);
      setError(null);
      try {
        const clubsRes = await axiosClient.get("/clubs/mine");
        const clubs = Array.isArray(clubsRes.data) ? clubsRes.data : [];

        if (clubs.length === 0) {
          setTeams([]);
          return;
        }

        const teamRequests = clubs.map((c) =>
          axiosClient.get(`/clubs/${c.slug}/teams`),
        );
        const teamResponses = await Promise.all(teamRequests);
        const allTeams = teamResponses.flatMap((res) =>
          Array.isArray(res.data) ? res.data : [],
        );

        setTeams(allTeams);
        if (allTeams.length > 0) setSelectedTeam(allTeams[0]);
      } catch {
        setError("Failed to load teams.");
      } finally {
        setLoadingTeams(false);
      }
    }
    fetchMyTeams();
  }, []);

  // Step 2: fetch roster whenever selectedTeam changes
  // Uses teamResponseDto.clubSlug + teamResponseDto.slug for the URL
  useEffect(() => {
    if (!selectedTeam) return;
    async function fetchRoster() {
      setLoadingRoster(true);
      try {
        const res = await axiosClient.get(
          `/clubs/${selectedTeam.clubSlug}/teams/${selectedTeam.slug}/roster`,
        );
        setRoster(Array.isArray(res.data) ? res.data : []);
      } catch {
        setRoster([]);
      } finally {
        setLoadingRoster(false);
      }
    }
    fetchRoster();
  }, [selectedTeam]);

  if (loadingTeams) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Teams</div>
            <h1 className={styles.title}>My Teams</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading teams...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Teams</div>
            <h1 className={styles.title}>My Teams</h1>
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
          <div className={styles.greeting}>// Teams</div>
          <h1 className={styles.title}>My Teams</h1>
        </div>
        {/* Navigate to /find with teams section pre-selected */}
        <button
          className={styles.primaryBtn}
          onClick={() => navigate("/find", { state: { section: "teams" } })}
        >
          + Find a Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <div className={styles.emptyText}>You're not on any teams yet.</div>
        </div>
      ) : (
        <>
          <div className={styles.teamGrid}>
            {teams.map((t) => {
              const genderLabel =
                GENDER_LABEL[t.genderCategory] || t.genderCategory || "";
              const levelLabel =
                LEVEL_LABEL[t.skillLevel] || t.skillLevel || "";
              const emoji = GENDER_EMOJI[t.genderCategory] || "⚽";
              const isSelected = selectedTeam?.id === t.id;

              return (
                <div
                  key={t.id}
                  className={styles.teamCard}
                  style={isSelected ? { borderColor: "#40916c" } : {}}
                >
                  <div className={styles.teamHeader}>
                    <div className={styles.teamEmoji}>{emoji}</div>
                    <div className={styles.teamMeta}>
                      <div className={styles.teamName}>{t.name}</div>
                      <div className={styles.teamClub}>{t.clubName || ""}</div>
                    </div>
                    {/* Fixed: TeamResponseDto uses isRecruiting not recruiting */}
                    {t.isRecruiting && (
                      <span className={styles.recruitingBadge}>Recruiting</span>
                    )}
                  </div>

                  <div className={styles.teamTags}>
                    {levelLabel && (
                      <span className={styles.miniTag}>{levelLabel}</span>
                    )}
                    {genderLabel && (
                      <span className={styles.miniTag}>{genderLabel}</span>
                    )}
                  </div>

                  <div className={styles.teamStatRow}>
                    <div className={styles.teamStat}>
                      <span className={styles.teamStatVal}>
                        {[t.city, t.state].filter(Boolean).join(", ") || "—"}
                      </span>
                      <span className={styles.teamStatLabel}>Location</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {/* View Roster — selects this team and shows roster preview below */}
                    <button
                      className={styles.ghostBtn}
                      onClick={() => setSelectedTeam(t)}
                    >
                      {isSelected ? "Viewing Roster ✓" : "View Roster →"}
                    </button>
                    {/* View Team — navigates to /teams/:clubSlug/:teamSlug */}
                    <button
                      className={styles.ghostBtn}
                      onClick={() => navigate(`/teams/${t.clubSlug}/${t.slug}`)}
                    >
                      View Team →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Roster preview for selected team */}
          {selectedTeam && (
            <div className={styles.card} style={{ marginTop: "2rem" }}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  {selectedTeam.name} — Roster
                </div>
                {/* Full Roster navigates to the team detail page */}
                <button
                  className={styles.ghostBtn}
                  onClick={() =>
                    navigate(
                      `/teams/${selectedTeam.clubSlug}/${selectedTeam.slug}`,
                    )
                  }
                >
                  Full Roster →
                </button>
              </div>

              {loadingRoster ? (
                <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
                  Loading roster...
                </div>
              ) : roster.length === 0 ? (
                <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
                  No roster members found.
                </div>
              ) : (
                <div className={styles.rosterTable}>
                  <div className={styles.rosterHead}>
                    <span>Name</span>
                    <span>Position</span>
                    <span>Role</span>
                  </div>
                  {roster.map((p, i) => (
                    <div key={p.userId || i} className={styles.rosterRow}>
                      <span className={styles.rosterName}>
                        {p.firstName} {p.lastName}
                      </span>
                      <span className={styles.rosterPos}>
                        {p.position || "—"}
                      </span>
                      <span className={styles.rosterPos}>
                        {p.role || "Player"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
