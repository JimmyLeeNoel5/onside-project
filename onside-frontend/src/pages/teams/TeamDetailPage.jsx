import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import styles from "./TeamDetailPage.module.css";

// Maps GenderCategory enum to readable labels
const GENDER_LABELS = {
  MALE: "Men's",
  FEMALE: "Women's",
  COED: "Co-Ed",
  OPEN: "Open",
};

// Maps SkillLevel enum to readable labels
const LEVEL_LABELS = {
  RECREATIONAL: "Recreational",
  INTERMEDIATE: "Intermediate",
  COMPETITIVE: "Competitive",
  ELITE: "Elite",
  SEMI_PRO: "Semi-Pro",
  PROFESSIONAL: "Professional",
};

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

export default function TeamDetailPage() {
  // URL pattern: /teams/:clubSlug/:teamSlug
  // We need both slugs because the backend endpoint is:
  // GET /clubs/{clubSlug}/teams/{teamSlug}
  const { clubSlug, teamSlug } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch team from GET /clubs/:clubSlug/teams/:teamSlug
  // Then fetch the roster from GET /clubs/:clubSlug/teams/:teamSlug/roster
  // Both requests fire in parallel with Promise.all for speed.
  useEffect(() => {
    async function fetchTeam() {
      try {
        const [teamRes, rosterRes] = await Promise.all([
          axiosClient.get(`/clubs/${clubSlug}/teams/${teamSlug}`),
          axiosClient.get(`/clubs/${clubSlug}/teams/${teamSlug}/roster`),
        ]);
        setTeam(teamRes.data);
        setRoster(Array.isArray(rosterRes.data) ? rosterRes.data : []);
      } catch {
        setError("Team not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [clubSlug, teamSlug]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading team...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className={styles.errorWrap}>
        <h2>Team not found</h2>
        <button className={styles.backBtn} onClick={() => navigate("/find")}>
          Back to Browse
        </button>
      </div>
    );
  }

  const genderLabel =
    GENDER_LABELS[team.genderCategory] || team.genderCategory || "";
  const levelLabel = LEVEL_LABELS[team.skillLevel] || team.skillLevel || "";

  // Build a color swatch from primaryColor / secondaryColor if set.
  // These are hex strings from TeamResponseDto e.g. "#1a1a2e"
  const hasPrimaryColor = team.primaryColor && team.primaryColor !== "";

  return (
    <div className={styles.page}>
      {/* Sticky top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span>←</span> Back
        </button>
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          {/* Team logo or color swatch placeholder */}
          <div className={styles.logoWrap}>
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className={styles.logoImg}
              />
            ) : (
              <div
                className={styles.logoPlaceholder}
                style={hasPrimaryColor ? { background: team.primaryColor } : {}}
              >
                {team.name?.[0] || "T"}
              </div>
            )}
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.heroBadges}>
              {genderLabel && (
                <span className={`${styles.badge} ${styles.badgeGender}`}>
                  {genderLabel}
                </span>
              )}
              {levelLabel && (
                <span className={`${styles.badge} ${styles.badgeLevel}`}>
                  {levelLabel}
                </span>
              )}
              {/* Recruiting badge — shown when team.isRecruiting is true */}
              {team.isRecruiting && (
                <span className={`${styles.badge} ${styles.badgeRecruiting}`}>
                  Recruiting
                </span>
              )}
              {!team.isActive && (
                <span className={`${styles.badge} ${styles.badgeInactive}`}>
                  Inactive
                </span>
              )}
            </div>

            {/* team.name is the full team name from TeamResponseDto */}
            <h1 className={styles.teamTitle}>{team.name}</h1>

            {/* team.clubName is the parent club's name */}
            {team.clubName && (
              <p className={styles.clubName}>{team.clubName}</p>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left column: description + details + roster */}
          <div className={styles.main}>
            {team.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About this Team</h2>
                <p className={styles.description}>{team.description}</p>
              </section>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Team Info</h2>
              <div className={styles.infoGrid}>
                {genderLabel && (
                  <InfoRow icon="⚥" label="Gender" value={genderLabel} />
                )}
                {levelLabel && (
                  <InfoRow icon="📊" label="Level" value={levelLabel} />
                )}
                {/* team.city + team.state from TeamResponseDto */}
                {(team.city || team.state) && (
                  <InfoRow
                    icon="📍"
                    label="Location"
                    value={[team.city, team.state].filter(Boolean).join(", ")}
                  />
                )}
                {/* team.homeVenue from TeamResponseDto */}
                {team.homeVenue && (
                  <InfoRow
                    icon="🏟️"
                    label="Home Venue"
                    value={team.homeVenue}
                  />
                )}
                {/* team.clubName links back to the parent club */}
                {team.clubName && (
                  <InfoRow icon="🏛️" label="Club" value={team.clubName} />
                )}
              </div>
            </section>

            {/* Roster section */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Roster
                {roster.length > 0 && (
                  <span className={styles.rosterCount}>
                    {roster.length} players
                  </span>
                )}
              </h2>

              {roster.length === 0 ? (
                <p className={styles.emptyRoster}>No roster members found.</p>
              ) : (
                <div className={styles.rosterTable}>
                  <div className={styles.rosterHead}>
                    <span>Name</span>
                    <span>Position</span>
                    <span>Role</span>
                  </div>
                  {roster.map((p, i) => (
                    // TeamRosterResponseDto fields: userId, firstName, lastName, position, role
                    <div key={p.userId || i} className={styles.rosterRow}>
                      <span className={styles.rosterName}>
                        {p.firstName} {p.lastName}
                      </span>
                      <span className={styles.rosterPos}>
                        {p.position || "—"}
                      </span>
                      <span className={styles.rosterRole}>
                        {p.role || "Player"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column: sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>
                {team.isRecruiting ? "Open for Tryouts" : "Not Recruiting"}
              </div>
              <p className={styles.sidebarText}>
                {team.isRecruiting
                  ? "This team is currently looking for new players. Request to join below."
                  : "This team is not currently accepting new players."}
              </p>

              <button className={styles.joinBtn} disabled={!team.isRecruiting}>
                {team.isRecruiting ? "Request to Join →" : "Roster Full"}
              </button>

              {/* Team color swatches if colors are set */}
              {(team.primaryColor || team.secondaryColor) && (
                <div className={styles.colorSwatches}>
                  <span className={styles.swatchLabel}>Team Colors</span>
                  <div className={styles.swatchRow}>
                    {team.primaryColor && (
                      <div
                        className={styles.swatch}
                        style={{ background: team.primaryColor }}
                        title={team.primaryColor}
                      />
                    )}
                    {team.secondaryColor && (
                      <div
                        className={styles.swatch}
                        style={{ background: team.secondaryColor }}
                        title={team.secondaryColor}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
