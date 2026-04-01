import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";

const GENDER_LABEL = {
  YOUTH_BOYS: "Boys",
  YOUTH_GIRLS: "Girls",
  MEN: "Men's",
  WOMEN: "Women's",
  COED: "Co-Ed",
  OPEN: "Open",
};

const LEVEL_LABEL = {
  RECREATIONAL: "Recreational",
  COMPETITIVE: "Competitive",
  INTERMEDIATE: "Intermediate",
  ELITE: "Elite",
};

const SUBTAB_GENDER_MAP = {
  "youth-boys": "YOUTH_BOYS",
  "youth-girls": "YOUTH_GIRLS",
};

const CONTENT_TABS = ["Events", "Teams", "Tournaments"];
const AGE_GROUPS = ["All Ages", "U8", "U10", "U12", "U14", "U16", "U18", "U19+"];
const LEVELS = ["All Levels", "Recreational", "Competitive", "Intermediate", "Elite"];

const SUBCHILD_TYPE_MAP = {
  recreational: "Recreational",
  academy: "Academy",
  ymca: "YMCA",
};

// subtab: "youth-boys" | "youth-girls"
export default function BrowseYouth({ subtab, subchild }) {
  const navigate = useNavigate();

  const [contentTab, setContentTab] = useState("Events");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [ageGroup, setAgeGroup] = useState("All Ages");
  const [level, setLevel] = useState("All Levels");

  // Derive state options from fetched data
  const stateOptions = useMemo(() => {
    const unique = [...new Set(items.map((i) => i.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [items]);
  const [state, setState] = useState("All States");

  // Reset filters when subtab or content tab changes
  useEffect(() => {
    setSearch("");
    setAgeGroup("All Ages");
    setLevel("All Levels");
    setState("All States");
  }, [subtab, contentTab]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setItems([]);
      try {
        const category = SUBTAB_GENDER_MAP[subtab];
        if (contentTab === "Events") {
          const params = new URLSearchParams({ eventType: "YOUTH" });
          if (category) params.append("category", category);
          const res = await axiosClient.get(`/events?${params.toString()}`);
          setItems(Array.isArray(res.data) ? res.data : []);
        } else if (contentTab === "Teams") {
          const params = new URLSearchParams();
          if (category) params.append("category", category);
          const res = await axiosClient.get(`/teams?${params.toString()}`);
          setItems(Array.isArray(res.data) ? res.data : []);
        } else {
          const params = new URLSearchParams({ eventType: "TOURNAMENT" });
          if (category) params.append("category", category);
          const res = await axiosClient.get(`/events?${params.toString()}`);
          setItems(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        setError("Failed to load youth content.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subtab, contentTab]);

  const isTournaments = contentTab === "Tournaments";
  const isTeams = contentTab === "Teams";

  const filtered = items.filter((item) => {
    const nameMatch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      (item.shortName || item.clubName || item.org || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const levelVal = isTournaments
      ? item.level
      : LEVEL_LABEL[item.skillLevel] || item.skillLevel || "";
    const levelMatch = level === "All Levels" || levelVal === level;

    const ageMatch =
      ageGroup === "All Ages" ||
      item.name?.includes(ageGroup) ||
      item.ageGroup === ageGroup;

    const stateMatch = state === "All States" || item.state === state;

    const typeFilter = SUBCHILD_TYPE_MAP[subchild];
    const typeMatch = !typeFilter || item.organizationType === typeFilter || item.programType === typeFilter;

    return nameMatch && levelMatch && ageMatch && stateMatch && typeMatch;
  });

  const contentLabel = contentTab.toLowerCase();

  return (
    <div>
      {/* In-page content tabs */}
      <div className={styles.innerTabs}>
        {CONTENT_TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.innerTab} ${contentTab === tab ? styles.innerTabActive : ""}`}
            onClick={() => setContentTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading youth {contentLabel}...</div>
        </div>
      ) : error ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⚠️</div>
          <div className={styles.emptyText}>{error}</div>
          <button className={styles.emptyReset} onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      ) : (
        <>
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
                placeholder={`Search youth ${contentLabel}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Age Group</label>
                <select
                  className={styles.filter}
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                >
                  {AGE_GROUPS.map((ag) => <option key={ag}>{ag}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Level</label>
                <select
                  className={styles.filter}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>State</label>
                <select
                  className={`${styles.filter} ${styles.filterScrollable}`}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  {stateOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.resultsCount}>
            {filtered.length} {contentLabel.replace(/s$/, "")}{filtered.length !== 1 ? "s" : ""} found
          </div>

          <div className={styles.grid}>
            {isTournaments && filtered.map((item) => (
              <div
                key={item.id}
                className={styles.card}
                onClick={() => navigate(`/events/${item.slug}`)}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>🥇</div>
                  <span
                    className={styles.statusBadge}
                    style={{
                      color: item.status === "Open" ? "#52b788" : item.status === "Filling Fast" ? "#f59e0b" : "#94a3b8",
                      borderColor: item.status === "Open" ? "rgba(82,183,136,0.3)" : item.status === "Filling Fast" ? "rgba(245,158,11,0.3)" : "rgba(148,163,184,0.3)",
                      background: item.status === "Open" ? "rgba(82,183,136,0.08)" : item.status === "Filling Fast" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.08)",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div className={styles.cardName}>{item.name}</div>
                <div className={styles.cardOrg}>{item.org}</div>
                <div className={styles.cardTags}>
                  <span className={styles.cardTag}>{item.ageGroup}</span>
                  <span className={styles.cardTag}>{item.level}</span>
                  <span className={styles.cardTag}>{item.format}</span>
                </div>
                <div className={styles.cardMeta}>
                  <span>📍 {[item.city, item.state].filter(Boolean).join(", ")}</span>
                  <span>📅 {item.date}</span>
                </div>
                <div className={styles.cardMeta} style={{ marginTop: "0.35rem" }}>
                  <span>👥 {item.teams} teams</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardFee}>{item.format}</span>
                  <button
                    className={styles.cardBtn}
                    disabled={item.status === "Closed"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.status !== "Closed") navigate(`/events/${item.slug}`);
                    }}
                  >
                    {item.status === "Closed" ? "Closed" : "Register →"}
                  </button>
                </div>
              </div>
            ))}

            {isTeams && filtered.map((item) => {
              const gLabel = GENDER_LABEL[item.genderCategory] || item.genderCategory || "";
              const lLabel = LEVEL_LABEL[item.skillLevel] || item.skillLevel || "";
              return (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => navigate(`/teams/${item.clubSlug}/${item.slug}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>⚽</div>
                    <span
                      className={styles.statusBadge}
                      style={{
                        color: item.isRecruiting ? "#52b788" : "#94a3b8",
                        borderColor: item.isRecruiting ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)",
                        background: item.isRecruiting ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)",
                      }}
                    >
                      {item.isRecruiting ? "Recruiting" : "Full"}
                    </span>
                  </div>
                  <div className={styles.cardName}>{item.name}</div>
                  <div className={styles.cardOrg}>{item.clubName || ""}</div>
                  <div className={styles.cardTags}>
                    {gLabel && <span className={styles.cardTag}>{gLabel}</span>}
                    {lLabel && <span className={styles.cardTag}>{lLabel}</span>}
                  </div>
                  <div className={styles.cardMeta}>
                    {(item.city || item.state) && (
                      <span>📍 {[item.city, item.state].filter(Boolean).join(", ")}</span>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFee}>{lLabel}</span>
                    <button
                      className={styles.cardBtn}
                      onClick={(e) => { e.stopPropagation(); navigate(`/teams/${item.clubSlug}/${item.slug}`); }}
                    >
                      View →
                    </button>
                  </div>
                </div>
              );
            })}

            {!isTournaments && !isTeams && filtered.map((item) => {
              const gLabel = GENDER_LABEL[item.genderCategory] || item.genderCategory || "";
              const lLabel = LEVEL_LABEL[item.skillLevel] || item.skillLevel || "";
              const isActive = item.isActive !== false;
              return (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => navigate(`/events/${item.slug}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>⭐</div>
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
                  <div className={styles.cardName}>{item.name}</div>
                  <div className={styles.cardOrg}>{item.shortName || ""}</div>
                  <div className={styles.cardTags}>
                    {gLabel && <span className={styles.cardTag}>{gLabel}</span>}
                    {lLabel && <span className={styles.cardTag}>{lLabel}</span>}
                    {item.foundedYear && <span className={styles.cardTag}>Est. {item.foundedYear}</span>}
                  </div>
                  <div className={styles.cardMeta}>
                    {(item.city || item.state) && (
                      <span>📍 {[item.city, item.state].filter(Boolean).join(", ")}</span>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFee}>{gLabel}</span>
                    <button
                      className={styles.cardBtn}
                      onClick={(e) => { e.stopPropagation(); navigate(`/events/${item.slug}`); }}
                    >
                      View →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyText}>No youth {contentLabel} found</div>
              <button
                className={styles.emptyReset}
                onClick={() => {
                  setSearch("");
                  setAgeGroup("All Ages");
                  setLevel("All Levels");
                  setState("All States");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
