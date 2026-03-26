import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";

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

const SUBTAB_GENDER_MAP = {
  "indoor-mens": "MALE",
  "indoor-womens": "FEMALE",
  "indoor-coed": "COED",
};

const LEVEL_TABS = ["All", "Professional", "Semi-Pro", "Amateur", "Recreational"];

const LEVEL_TAB_MATCH = {
  Professional: ["Professional", "Semi-Pro"],
  "Semi-Pro": ["Semi-Pro"],
  Amateur: ["Intermediate", "Competitive"],
  Recreational: ["Recreational"],
};

const STATUSES = ["All Statuses", "Active", "Inactive"];

export default function BrowseIndoor({ subtab }) {
  const navigate = useNavigate();

  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelTab, setLevelTab] = useState("All");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All States");
  const [status, setStatus] = useState("All Statuses");

  const stateOptions = useMemo(() => {
    const unique = [...new Set(leagues.map((l) => l.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [leagues]);

  useEffect(() => {
    setSearch("");
    setLevelTab("All");
    setState("All States");
    setStatus("All Statuses");
  }, [subtab]);

  useEffect(() => {
    async function fetchLeagues() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ leagueType: "INDOOR" });
        const category = SUBTAB_GENDER_MAP[subtab];
        if (category) params.append("category", category);
        const res = await axiosClient.get(`/leagues?${params.toString()}`);
        setLeagues(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Failed to load indoor leagues. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeagues();
  }, [subtab]);

  const filtered = leagues.filter((l) => {
    const levelLabel = LEVEL_LABEL[l.skillLevel] || l.skillLevel || "";
    const leagueStatus = l.isActive ? "Active" : "Inactive";

    const matchSearch =
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.shortName?.toLowerCase().includes(search.toLowerCase());

    const matchLevel =
      levelTab === "All" ||
      (LEVEL_TAB_MATCH[levelTab]
        ? LEVEL_TAB_MATCH[levelTab].includes(levelLabel)
        : levelLabel === levelTab);

    const matchState = state === "All States" || l.state === state;
    const matchStatus = status === "All Statuses" || leagueStatus === status;

    return matchSearch && matchLevel && matchState && matchStatus;
  });

  if (loading)
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⏳</div>
        <div className={styles.emptyText}>Loading indoor leagues...</div>
      </div>
    );

  if (error)
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⚠️</div>
        <div className={styles.emptyText}>{error}</div>
        <button className={styles.emptyReset} onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );

  return (
    <div>
      {/* Level tabs */}
      <div className={styles.innerTabs}>
        {LEVEL_TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.innerTab} ${levelTab === tab ? styles.innerTabActive : ""}`}
            onClick={() => setLevelTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
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
            placeholder="Search indoor leagues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>State</label>
            <select
              className={`${styles.filter} ${styles.filterScrollable}`}
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {stateOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filter}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.resultsCount}>
        {filtered.length} league{filtered.length !== 1 ? "s" : ""} found
      </div>

      <div className={styles.grid}>
        {filtered.map((l) => {
          const genderLabel = GENDER_LABEL[l.genderCategory] || l.genderCategory || "";
          const levelLabel = LEVEL_LABEL[l.skillLevel] || l.skillLevel || "";
          const isActive = l.isActive !== false;

          return (
            <div
              key={l.id}
              className={styles.card}
              onClick={() => navigate(`/leagues/${l.slug}`)}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>🏟️</div>
                <span
                  className={styles.statusBadge}
                  style={{
                    color: isActive ? "#52b788" : "#94a3b8",
                    borderColor: isActive ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)",
                    background: isActive ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)",
                  }}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className={styles.cardName}>{l.name}</div>
              <div className={styles.cardOrg}>{l.shortName || ""}</div>
              <div className={styles.cardTags}>
                {levelLabel && <span className={styles.cardTag}>{levelLabel}</span>}
                {genderLabel && <span className={styles.cardTag}>{genderLabel}</span>}
                {l.foundedYear && <span className={styles.cardTag}>Est. {l.foundedYear}</span>}
              </div>
              <div className={styles.cardMeta}>
                {(l.city || l.state) && (
                  <span>📍 {[l.city, l.state].filter(Boolean).join(", ")}</span>
                )}
                {l.website && <span>🌐 {l.website}</span>}
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardFee}>{levelLabel}</span>
                <button
                  className={styles.cardBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/leagues/${l.slug}`);
                  }}
                >
                  View League →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <div className={styles.emptyText}>No indoor leagues match your filters</div>
          <button
            className={styles.emptyReset}
            onClick={() => {
              setSearch("");
              setLevelTab("All");
              setState("All States");
              setStatus("All Statuses");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
