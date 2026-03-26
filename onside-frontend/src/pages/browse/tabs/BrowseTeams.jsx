import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";

// Maps GenderCategory enum values to readable labels
const GENDER_LABEL = {
  MALE: "Men's",
  FEMALE: "Women's",
  COED: "Co-Ed",
  OPEN: "Open",
};

// Maps SkillLevel enum values to readable labels
const LEVEL_LABEL = {
  RECREATIONAL: "Recreational",
  COMPETITIVE: "Competitive",
  INTERMEDIATE: "Intermediate",
  SEMI_PRO: "Semi-Pro",
  PROFESSIONAL: "Professional",
  ELITE: "Elite",
};

// Emoji assigned per gender category for visual variety on cards
const GENDER_EMOJI = {
  MALE: "🔵",
  FEMALE: "🟣",
  COED: "🔴",
  OPEN: "🟢",
};

const LEVELS = [
  "All",
  "Recreational",
  "Competitive",
  "Intermediate",
  "Semi-Pro",
];
const GENDERS = ["All", "Men's", "Women's", "Co-Ed", "Open"];
const RECRUITING = ["All", "Recruiting", "Full"];

export default function BrowseTeams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [gender, setGender] = useState("All");
  const [recruiting, setRecruiting] = useState("All");

  // Fetch all teams from GET /teams (flat list across all clubs).
  // TeamController supports optional query params ?category=&level=&state=&recruiting=
  // We fetch all and filter client-side for now.
  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get("/teams");
        setTeams(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Failed to load teams. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  // Client-side filtering
  const filtered = teams.filter((t) => {
    const teamGender = GENDER_LABEL[t.genderCategory] || t.genderCategory || "";
    const teamLevel = LEVEL_LABEL[t.skillLevel] || t.skillLevel || "";

    const matchSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.clubName?.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === "All" || teamLevel === level;
    const matchGender = gender === "All" || teamGender === gender;

    // TeamResponseDto uses isRecruiting (not recruiting)
    const matchRecruiting =
      recruiting === "All" ||
      (recruiting === "Recruiting" && t.isRecruiting) ||
      (recruiting === "Full" && !t.isRecruiting);

    return matchSearch && matchLevel && matchGender && matchRecruiting;
  });

  if (loading) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⏳</div>
        <div className={styles.emptyText}>Loading teams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⚠️</div>
        <div className={styles.emptyText}>{error}</div>
        <button
          className={styles.emptyReset}
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search + filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search teams, clubs, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Level</label>
            <select
              className={styles.filter}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Gender</label>
            <select
              className={styles.filter}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Recruiting</label>
            <select
              className={styles.filter}
              value={recruiting}
              onChange={(e) => setRecruiting(e.target.value)}
            >
              {RECRUITING.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.resultsCount}>
        {filtered.length} team{filtered.length !== 1 ? "s" : ""} found
      </div>

      <div className={styles.grid}>
        {filtered.map((t) => {
          const genderLabel =
            GENDER_LABEL[t.genderCategory] || t.genderCategory || "";
          const levelLabel = LEVEL_LABEL[t.skillLevel] || t.skillLevel || "";
          const emoji = GENDER_EMOJI[t.genderCategory] || "⚽";

          return (
            // Clicking anywhere on the card navigates to the team detail page.
            // URL pattern: /teams/:clubSlug/:teamSlug
            // Both slugs come from TeamResponseDto.
            <div
              key={t.id}
              className={styles.card}
              onClick={() => navigate(`/teams/${t.clubSlug}/${t.slug}`)}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>{emoji}</div>
                <span
                  className={styles.statusBadge}
                  style={{
                    // TeamResponseDto uses isRecruiting (boolean)
                    color: t.isRecruiting ? "#52b788" : "#94a3b8",
                    borderColor: t.isRecruiting
                      ? "rgba(82,183,136,0.3)"
                      : "rgba(148,163,184,0.3)",
                    background: t.isRecruiting
                      ? "rgba(82,183,136,0.08)"
                      : "rgba(148,163,184,0.08)",
                  }}
                >
                  {t.isRecruiting ? "Recruiting" : "Full"}
                </span>
              </div>

              {/* team.name and team.clubName from TeamResponseDto */}
              <div className={styles.cardName}>{t.name}</div>
              <div className={styles.cardOrg}>{t.clubName || ""}</div>

              <div className={styles.cardTags}>
                {levelLabel && (
                  <span className={styles.cardTag}>{levelLabel}</span>
                )}
                {genderLabel && (
                  <span className={styles.cardTag}>{genderLabel}</span>
                )}
              </div>

              <div className={styles.cardMeta}>
                {(t.city || t.state) && (
                  <span>📍 {[t.city, t.state].filter(Boolean).join(", ")}</span>
                )}
                {/* team.homeVenue from TeamResponseDto */}
                {t.homeVenue && <span>🏟️ {t.homeVenue}</span>}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.cardFee}>{levelLabel}</span>
                <button
                  className={styles.cardBtn}
                  disabled={!t.isRecruiting}
                  // stopPropagation prevents the card onClick from firing twice
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teams/${t.clubSlug}/${t.slug}`);
                  }}
                >
                  {t.isRecruiting ? "View Team →" : "Full"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <div className={styles.emptyText}>No teams match your filters</div>
          <button
            className={styles.emptyReset}
            onClick={() => {
              setSearch("");
              setLevel("All");
              setGender("All");
              setRecruiting("All");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
