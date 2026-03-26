import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";
import pickupStyles from "./BrowsePickup.module.css";

const GENDER_LABEL = {
  MALE: "Men's",
  FEMALE: "Women's",
  COED: "Co-Ed",
  OPEN: "Open",
};

// In-page gender tabs per subtab
const GENDER_TABS = {
  "tryouts-adults": ["All", "Men", "Women"],
  "tryouts-youth": ["All", "Boys", "Girls"],
};

const YOUTH_AGE_GROUPS = ["All Ages", "U6", "U8", "U10", "U12", "U14", "U16", "U18", "U19+"];

// Maps gender tab label → API category value
const GENDER_TAB_MAP = {
  Men: "MALE",
  Women: "FEMALE",
  Boys: "MALE",
  Girls: "FEMALE",
};

export default function BrowseTryouts({ subtab }) {
  const navigate = useNavigate();

  const [tryouts, setTryouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genderTab, setGenderTab] = useState("All");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All States");
  const [zipcode, setZipcode] = useState("");
  const [ageGroup, setAgeGroup] = useState("All Ages");

  const isYouth = subtab === "tryouts-youth";
  const genderTabs = GENDER_TABS[subtab] || GENDER_TABS["tryouts-adults"];

  // Derive state options from fetched data
  const stateOptions = useMemo(() => {
    const unique = [...new Set(tryouts.map((t) => t.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [tryouts]);

  // Reset when subtab changes
  useEffect(() => {
    setGenderTab("All");
    setSearch("");
    setState("All States");
    setZipcode("");
    setAgeGroup("All Ages");
  }, [subtab]);

  useEffect(() => {
    async function fetchTryouts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          tryoutType: isYouth ? "YOUTH" : "ADULT",
        });
        const category = genderTab !== "All" ? GENDER_TAB_MAP[genderTab] : null;
        if (category) params.append("category", category);
        const res = await axiosClient.get(`/tryouts?${params.toString()}`);
        setTryouts(Array.isArray(res.data) ? res.data : []);
      } catch {
        // API not yet available — show empty state with filters
        setTryouts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTryouts();
  }, [subtab, genderTab]);

  const filtered = tryouts.filter((t) => {
    const matchSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.teamName?.toLowerCase().includes(search.toLowerCase()) ||
      t.organization?.toLowerCase().includes(search.toLowerCase());

    const matchState = state === "All States" || t.state === state;

    const matchZip = !zipcode.trim() || t.zipcode?.startsWith(zipcode.trim());

    const matchAge = !isYouth || ageGroup === "All Ages" || t.ageGroup === ageGroup;

    return matchSearch && matchState && matchZip && matchAge;
  });

  return (
    <div>
      {/* Gender tabs */}
      <div className={styles.innerTabs}>
        {genderTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.innerTab} ${genderTab === tab ? styles.innerTabActive : ""}`}
            onClick={() => setGenderTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading tryouts...</div>
        </div>
      ) : (
        <>
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
                placeholder="Search tryouts, teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filters}>
              {isYouth && (
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Age Group</label>
                  <select
                    className={`${styles.filter} ${styles.filterScrollable}`}
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                  >
                    {YOUTH_AGE_GROUPS.map((ag) => (
                      <option key={ag}>{ag}</option>
                    ))}
                  </select>
                </div>
              )}
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
                <label className={styles.filterLabel}>Zip Code</label>
                <div className={pickupStyles.zipcodeWrap} style={{ minWidth: 0 }}>
                  <svg
                    className={pickupStyles.zipcodeIcon}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <input
                    className={pickupStyles.zipcodeInput}
                    type="text"
                    placeholder="Zip code..."
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    maxLength={10}
                    style={{ paddingTop: "0.65rem", paddingBottom: "0.65rem" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.resultsCount}>
            {filtered.length} tryout{filtered.length !== 1 ? "s" : ""} found
          </div>

          <div className={styles.grid}>
            {filtered.map((t) => {
              const genderLabel = GENDER_LABEL[t.genderCategory] || t.genderCategory || "";
              const tryoutDate = t.date
                ? new Date(t.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : null;
              const isOpen = t.status !== "Closed" && t.status !== "Full";
              const statusColor = isOpen ? "#52b788" : "#94a3b8";
              const statusBorder = isOpen ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)";
              const statusBg = isOpen ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)";

              return (
                <div
                  key={t.id}
                  className={styles.card}
                  onClick={() => navigate(`/tryouts/${t.slug}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>📋</div>
                    <span
                      className={styles.statusBadge}
                      style={{ color: statusColor, borderColor: statusBorder, background: statusBg }}
                    >
                      {t.status || "Open"}
                    </span>
                  </div>
                  <div className={styles.cardName}>{t.name || t.teamName}</div>
                  <div className={styles.cardOrg}>{t.organization || t.clubName || ""}</div>
                  <div className={styles.cardTags}>
                    {genderLabel && <span className={styles.cardTag}>{genderLabel}</span>}
                    {t.ageGroup && <span className={styles.cardTag}>{t.ageGroup}</span>}
                    {t.skillLevel && <span className={styles.cardTag}>{t.skillLevel}</span>}
                  </div>
                  <div className={styles.cardMeta}>
                    {(t.city || t.state) && (
                      <span>📍 {[t.city, t.state].filter(Boolean).join(", ")}</span>
                    )}
                    {tryoutDate && <span>📅 {tryoutDate}</span>}
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFee}>
                      {t.fee ? `$${t.fee}` : "Free"}
                    </span>
                    <button
                      className={styles.cardBtn}
                      disabled={!isOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOpen) navigate(`/tryouts/${t.slug}`);
                      }}
                    >
                      {isOpen ? "View →" : "Closed"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyText}>No tryouts found</div>
              <button
                className={styles.emptyReset}
                onClick={() => {
                  setSearch("");
                  setState("All States");
                  setZipcode("");
                  setAgeGroup("All Ages");
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
