import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import styles from "./LeagueDetailPage.module.css";

// Maps GenderCategory enum values to readable labels
const GENDER_LABELS = {
  MEN: "Men's",
  WOMEN: "Women's",
  YOUTH_BOYS: "Youth Boys",
  YOUTH_GIRLS: "Youth Girls",
  COED: "Co-Ed",
  OPEN: "Open",
};

// Maps SkillLevel enum values to readable labels
const LEVEL_LABELS = {
  RECREATIONAL: "Recreational",
  INTERMEDIATE: "Intermediate",
  COMPETITIVE: "Competitive",
  ELITE: "Elite",
  SEMI_PRO: "Semi-Pro",
  PROFESSIONAL: "Professional",
};

// Small info row used in the details grid
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

export default function LeagueDetailPage() {
  // Pull the slug from the URL: /leagues/:slug
  const { slug } = useParams();
  const navigate = useNavigate();

  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamSearch, setTeamSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");

  useEffect(() => {
    async function fetchLeague() {
      try {
        const res = await axiosClient.get(`/leagues/${slug}`);
        setLeague(res.data);
      } catch {
        setError("League not found.");
      } finally {
        setLoading(false);
      }
    }
    async function fetchTeams() {
      try {
        const res = await axiosClient.get(`/leagues/${slug}/teams`);
        setTeams(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTeams([]);
      } finally {
        setTeamsLoading(false);
      }
    }
    fetchLeague();
    fetchTeams();
  }, [slug]);

  const stateOptions = useMemo(() => {
    const unique = [...new Set(teams.map((t) => t.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchState = stateFilter === "All States" || t.state === stateFilter;
      const q = teamSearch.toLowerCase();
      const matchSearch =
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.clubName?.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q);
      return matchState && matchSearch;
    });
  }, [teams, stateFilter, teamSearch]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading league...</p>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className={styles.errorWrap}>
        <h2>League not found</h2>
        <button className={styles.backBtn} onClick={() => navigate("/find")}>
          Back to Browse
        </button>
      </div>
    );
  }

  // Convert enum values to readable labels
  const genderLabel =
    GENDER_LABELS[league.genderCategory] || league.genderCategory || "";
  const levelLabel = LEVEL_LABELS[league.skillLevel] || league.skillLevel || "";

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
          {/* Logo placeholder — shows first letter of league name if no logo */}
          <div className={styles.logoWrap}>
            {league.logoUrl ? (
              <img
                src={league.logoUrl}
                alt={league.name}
                className={styles.logoImg}
              />
            ) : (
              <div className={styles.logoPlaceholder}>
                {league.name?.[0] || "L"}
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
              {/* Show inactive badge if the league is no longer active */}
              {!league.isActive && (
                <span className={`${styles.badge} ${styles.badgeInactive}`}>
                  Inactive
                </span>
              )}
            </div>

            {/* league.name is the full league name from LeagueResponseDto */}
            <h1 className={styles.leagueTitle}>{league.name}</h1>

            {/* league.shortName is the abbreviated name e.g. "USL" */}
            {league.shortName && (
              <p className={styles.shortName}>{league.shortName}</p>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left column: description + details */}
          <div className={styles.main}>
            {league.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About this League</h2>
                <p className={styles.description}>{league.description}</p>
              </section>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Teams
                {!teamsLoading && teams.length > 0 && (
                  <span className={styles.teamCount}>{filteredTeams.length} / {teams.length}</span>
                )}
              </h2>
              {teamsLoading ? (
                <p className={styles.emptyTeams}>Loading teams...</p>
              ) : teams.length === 0 ? (
                <p className={styles.emptyTeams}>No teams enrolled in the current season.</p>
              ) : (
                <>
                  <div className={styles.teamFilterBar}>
                    <div className={styles.teamSearchWrap}>
                      <svg className={styles.teamSearchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        className={styles.teamSearchInput}
                        placeholder="Search teams..."
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                      />
                    </div>
                    <div className={styles.teamFilterGroup}>
                      <label className={styles.teamFilterLabel}>State</label>
                      <select
                        className={styles.teamFilterSelect}
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                      >
                        {stateOptions.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {filteredTeams.length === 0 ? (
                    <div className={styles.emptyTeams}>
                      No teams match your filters.
                      <button className={styles.resetBtn} onClick={() => { setTeamSearch(""); setStateFilter("All States"); }}>Reset</button>
                    </div>
                  ) : (
                    <div className={styles.teamGrid}>
                      {filteredTeams.map((t) => (
                        <div
                          key={t.id}
                          className={styles.teamCard}
                          onClick={() => navigate(`/teams/${t.clubSlug}/${t.slug}`)}
                        >
                          <div className={styles.teamCardInitial}>
                            {t.name?.[0] || "T"}
                          </div>
                          <div className={styles.teamCardBody}>
                            <div className={styles.teamCardName}>{t.name}</div>
                            {t.clubName && t.clubName !== t.name && (
                              <div className={styles.teamCardClub}>{t.clubName}</div>
                            )}
                            {(t.city || t.state) && (
                              <div className={styles.teamCardLocation}>
                                📍 {[t.city, t.state].filter(Boolean).join(", ")}
                              </div>
                            )}
                          </div>
                          <span className={styles.teamCardArrow}>→</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>League Info</h2>
              <div className={styles.infoGrid}>
                {genderLabel && (
                  <InfoRow icon="⚥" label="Gender" value={genderLabel} />
                )}
                {levelLabel && (
                  <InfoRow icon="📊" label="Level" value={levelLabel} />
                )}
                {/* league.foundedYear — Short type from the DTO */}
                {league.foundedYear && (
                  <InfoRow
                    icon="📅"
                    label="Founded"
                    value={league.foundedYear}
                  />
                )}
                {league.website && (
                  <InfoRow
                    icon="🌐"
                    label="Website"
                    value={
                      <a
                        href={league.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        {league.website}
                      </a>
                    }
                  />
                )}
              </div>
            </section>
          </div>

          {/* Right column: sidebar action card */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>Join this League</div>
              <p className={styles.sidebarText}>
                Interested in competing? Browse teams in this league or contact
                the league organizers directly.
              </p>
              <button
                className={styles.joinBtn}
                onClick={() =>
                  navigate("/find", { state: { section: "leagues" } })
                }
              >
                Browse Teams →
              </button>
              {league.website && (
                <a
                  href={league.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteBtn}
                >
                  Visit Website →
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
