import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "../../dashboard/sections/DashSection.module.css";

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

export default function ManageTeamsSection() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await axiosClient.get("/clubs/mine");
        const data = Array.isArray(res.data) ? res.data : [];
        setClubs(data);
        if (data.length > 0) setSelectedClub(data[0]);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  useEffect(() => {
    if (!selectedClub) return;
    async function fetchTeams() {
      try {
        const res = await axiosClient.get(`/clubs/${selectedClub.slug}/teams`);
        const data = Array.isArray(res.data) ? res.data : [];
        setTeams(data);
        setSelectedTeam(data[0] || null);
      } catch {
        setTeams([]);
      }
    }
    fetchTeams();
  }, [selectedClub]);

  useEffect(() => {
    if (!selectedTeam || !selectedClub) return;
    async function fetchRoster() {
      setLoadingRoster(true);
      try {
        const res = await axiosClient.get(
          `/clubs/${selectedClub.slug}/teams/${selectedTeam.slug}/roster`,
        );
        setRoster(Array.isArray(res.data) ? res.data : []);
      } catch {
        setRoster([]);
      } finally {
        setLoadingRoster(false);
      }
    }
    fetchRoster();
  }, [selectedTeam, selectedClub]);

  async function handleRemovePlayer(userId) {
    if (!window.confirm("Remove this player from the roster?")) return;
    try {
      await axiosClient.delete(
        `/clubs/${selectedClub.slug}/teams/${selectedTeam.slug}/roster/${userId}`,
      );
      setRoster((prev) => prev.filter((p) => p.userId !== userId));
    } catch {}
  }

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Teams</div>
            <h1 className={styles.title}>Teams & Rosters</h1>
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
          <div className={styles.greeting}>// Teams</div>
          <h1 className={styles.title}>Teams & Rosters</h1>
        </div>
      </div>

      {/* Club selector */}
      {clubs.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {clubs.map((c) => (
            <button
              key={c.id}
              className={
                selectedClub?.id === c.id ? styles.primaryBtn : styles.ghostBtn
              }
              onClick={() => setSelectedClub(c)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {teams.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <div className={styles.emptyText}>No teams found for this club.</div>
        </div>
      ) : (
        <>
          {/* Team tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {teams.map((t) => (
              <button
                key={t.id}
                className={
                  selectedTeam?.id === t.id
                    ? styles.primaryBtn
                    : styles.ghostBtn
                }
                onClick={() => setSelectedTeam(t)}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Team card */}
          {selectedTeam && (
            <div className={styles.teamGrid}>
              <div className={styles.teamCard}>
                <div className={styles.teamHeader}>
                  <div className={styles.teamEmoji}>👥</div>
                  <div className={styles.teamMeta}>
                    <div className={styles.teamName}>{selectedTeam.name}</div>
                    <div className={styles.teamClub}>
                      {selectedTeam.clubName || ""}
                    </div>
                  </div>
                  {selectedTeam.isRecruiting && (
                    <span className={styles.recruitingBadge}>Recruiting</span>
                  )}
                </div>
                <div className={styles.teamTags}>
                  {LEVEL_LABEL[selectedTeam.skillLevel] && (
                    <span className={styles.miniTag}>
                      {LEVEL_LABEL[selectedTeam.skillLevel]}
                    </span>
                  )}
                  {GENDER_LABEL[selectedTeam.genderCategory] && (
                    <span className={styles.miniTag}>
                      {GENDER_LABEL[selectedTeam.genderCategory]}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    className={styles.ghostBtn}
                    onClick={() =>
                      navigate(
                        `/teams/${selectedTeam.clubSlug}/${selectedTeam.slug}`,
                      )
                    }
                  >
                    View Page →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Roster management */}
          {selectedTeam && (
            <div className={styles.card} style={{ marginTop: "1.5rem" }}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  {selectedTeam.name} — Roster
                </div>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontStyle: "italic",
                    color: "#64748b",
                  }}
                >
                  {roster.length} players
                </span>
              </div>
              {loadingRoster ? (
                <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
                  Loading roster...
                </div>
              ) : roster.length === 0 ? (
                <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
                  No players on this roster yet.
                </div>
              ) : (
                <div className={styles.rosterTable}>
                  <div className={styles.rosterHead}>
                    <span>Name</span>
                    <span>Position</span>
                    <span>Role</span>
                    <span>Action</span>
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
                      <button
                        className={styles.ghostBtn}
                        style={{
                          fontSize: "0.75rem",
                          color: "#e63946",
                          borderColor: "rgba(230,57,70,0.3)",
                          padding: "0.25rem 0.6rem",
                        }}
                        onClick={() => handleRemovePlayer(p.userId)}
                      >
                        Remove
                      </button>
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
