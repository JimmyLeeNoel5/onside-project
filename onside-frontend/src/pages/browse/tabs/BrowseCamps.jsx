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

// Maps subtab → event API params
const SUBTAB_CONFIG = {
  "camps-coach": { eventType: "COACHING", label: "coaches", icon: "👨‍🏫" },
  "camps-clinics": { eventType: "CLINIC", label: "clinics", icon: "📚" },
  "camps-youth": { eventType: "CAMP", label: "camps", icon: "🏕️" },
  "camps-private": { eventType: "PRIVATE_TRAINING", label: "private training", icon: "🎯" },
};

const AGE_GROUPS = ["All Ages", "U8", "U10", "U12", "U14", "U16", "U18", "U19+", "Adult"];
const GENDERS = ["All Genders", "Men's", "Women's", "Boys", "Girls", "Co-Ed", "Open"];
const STATUSES = ["All Statuses", "Open", "Filling Fast", "Closed"];

export default function BrowseCamps({ subtab }) {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All States");
  const [ageGroup, setAgeGroup] = useState("All Ages");
  const [gender, setGender] = useState("All Genders");
  const [status, setStatus] = useState("All Statuses");

  const config = SUBTAB_CONFIG[subtab] || SUBTAB_CONFIG["camps-coach"];
  const isYouth = subtab === "camps-youth";

  const stateOptions = useMemo(() => {
    const unique = [...new Set(events.map((e) => e.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [events]);

  useEffect(() => {
    setSearch("");
    setState("All States");
    setAgeGroup("All Ages");
    setGender("All Genders");
    setStatus("All Statuses");
  }, [subtab]);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ eventType: config.eventType });
        const res = await axiosClient.get(`/events?${params.toString()}`);
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [subtab]);

  const filtered = events.filter((e) => {
    const genderLabel = GENDER_LABEL[e.genderCategory] || e.genderCategory || "";

    const matchSearch =
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.organization?.toLowerCase().includes(search.toLowerCase()) ||
      e.hostClubName?.toLowerCase().includes(search.toLowerCase());

    const matchState = state === "All States" || e.state === state;
    const matchAge = ageGroup === "All Ages" || e.ageGroup === ageGroup;
    const matchGender = gender === "All Genders" || genderLabel === gender;
    const matchStatus = status === "All Statuses" || e.status === status;

    return matchSearch && matchState && matchAge && matchGender && matchStatus;
  });

  return (
    <div>
      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading {config.label}...</div>
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
                placeholder={`Search ${config.label}...`}
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
                    {AGE_GROUPS.map((ag) => <option key={ag}>{ag}</option>)}
                  </select>
                </div>
              )}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Gender</label>
                <select
                  className={styles.filter}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  {GENDERS.map((g) => <option key={g}>{g}</option>)}
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
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select
                  className={styles.filter}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.resultsCount}>
            {filtered.length} {config.label.replace(/s$/, "")}{filtered.length !== 1 ? "s" : ""} found
          </div>

          <div className={styles.grid}>
            {filtered.map((e) => {
              const genderLabel = GENDER_LABEL[e.genderCategory] || e.genderCategory || "";
              const eventDate = e.startDate
                ? new Date(e.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;
              const endDate = e.endDate
                ? new Date(e.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : null;
              const dateDisplay = eventDate && endDate ? `${eventDate} – ${endDate}` : eventDate;

              const statusColor =
                e.status === "Open" ? "#52b788"
                : e.status === "Filling Fast" ? "#f59e0b"
                : "#94a3b8";
              const statusBorder =
                e.status === "Open" ? "rgba(82,183,136,0.3)"
                : e.status === "Filling Fast" ? "rgba(245,158,11,0.3)"
                : "rgba(148,163,184,0.3)";
              const statusBg =
                e.status === "Open" ? "rgba(82,183,136,0.08)"
                : e.status === "Filling Fast" ? "rgba(245,158,11,0.08)"
                : "rgba(148,163,184,0.08)";

              return (
                <div
                  key={e.id}
                  className={styles.card}
                  onClick={() => navigate(`/events/${e.slug}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>{config.icon}</div>
                    <span
                      className={styles.statusBadge}
                      style={{ color: statusColor, borderColor: statusBorder, background: statusBg }}
                    >
                      {e.status || "Open"}
                    </span>
                  </div>
                  <div className={styles.cardName}>{e.name}</div>
                  <div className={styles.cardOrg}>{e.organization || e.hostClubName || ""}</div>
                  <div className={styles.cardTags}>
                    {e.ageGroup && <span className={styles.cardTag}>{e.ageGroup}</span>}
                    {genderLabel && <span className={styles.cardTag}>{genderLabel}</span>}
                    {e.format && <span className={styles.cardTag}>{e.format}</span>}
                  </div>
                  <div className={styles.cardMeta}>
                    {(e.city || e.state) && (
                      <span>📍 {[e.city, e.state].filter(Boolean).join(", ")}</span>
                    )}
                    {dateDisplay && <span>📅 {dateDisplay}</span>}
                  </div>
                  {e.spotsAvailable != null && (
                    <div className={styles.cardMeta}>
                      <span>👥 {e.spotsAvailable} spots left</span>
                    </div>
                  )}
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFee}>
                      {e.fee ? `$${e.fee}` : "Free"}
                    </span>
                    <button
                      className={styles.cardBtn}
                      disabled={e.status === "Closed"}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (e.status !== "Closed") navigate(`/events/${e.slug}`);
                      }}
                    >
                      {e.status === "Closed" ? "Closed" : "Register →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyText}>No {config.label} found</div>
              <button
                className={styles.emptyReset}
                onClick={() => {
                  setSearch("");
                  setState("All States");
                  setAgeGroup("All Ages");
                  setGender("All Genders");
                  setStatus("All Statuses");
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
