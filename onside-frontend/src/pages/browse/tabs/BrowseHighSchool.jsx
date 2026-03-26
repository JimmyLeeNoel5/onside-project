import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";

const GENDER_LABEL = {
  MALE: "Boys",
  FEMALE: "Girls",
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
  "hs-boys": "MALE",
  "hs-girls": "FEMALE",
};

const CONTENT_TABS = ["Programs", "Events"];
const STATUSES = ["All Statuses", "Active", "Inactive"];
const EVENT_STATUSES = ["All Statuses", "Upcoming", "Open", "Filling Fast", "Closed"];

export default function BrowseHighSchool({ subtab }) {
  const navigate = useNavigate();
  const [contentTab, setContentTab] = useState("Programs");
  const category = SUBTAB_GENDER_MAP[subtab];
  const genderLabel = subtab === "hs-boys" ? "Boys" : "Girls";

  // ── Programs (leagues) ─────────────────────────────────────
  const [leagues, setLeagues] = useState([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [leagueSearch, setLeagueSearch] = useState("");
  const [leagueState, setLeagueState] = useState("All States");
  const [leagueStatus, setLeagueStatus] = useState("All Statuses");

  // ── Events ─────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsFetched, setEventsFetched] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [eventState, setEventState] = useState("All States");
  const [eventStatus, setEventStatus] = useState("All Statuses");

  const leagueStateOptions = useMemo(() => {
    const unique = [...new Set(leagues.map((l) => l.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [leagues]);

  const eventStateOptions = useMemo(() => {
    const unique = [...new Set(events.map((e) => e.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [events]);

  // Reset on subtab change
  useEffect(() => {
    setContentTab("Programs");
    setLeagueSearch(""); setLeagueState("All States"); setLeagueStatus("All Statuses");
    setEventSearch(""); setEventState("All States"); setEventStatus("All Statuses");
    setEventsFetched(false); setEvents([]);
  }, [subtab]);

  // Fetch programs
  useEffect(() => {
    async function fetchLeagues() {
      setLeaguesLoading(true);
      try {
        const params = new URLSearchParams({ leagueType: "HIGH_SCHOOL" });
        if (category) params.append("category", category);
        const res = await axiosClient.get(`/leagues?${params.toString()}`);
        setLeagues(Array.isArray(res.data) ? res.data : []);
      } catch {
        setLeagues([]);
      } finally {
        setLeaguesLoading(false);
      }
    }
    fetchLeagues();
  }, [subtab]);

  // Fetch events lazily
  useEffect(() => {
    if (contentTab !== "Events" || eventsFetched) return;
    async function fetchEvents() {
      setEventsLoading(true);
      try {
        const params = new URLSearchParams({ eventType: "HIGH_SCHOOL" });
        if (category) params.append("category", category);
        const res = await axiosClient.get(`/events?${params.toString()}`);
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEvents([]);
      } finally {
        setEventsLoading(false);
        setEventsFetched(true);
      }
    }
    fetchEvents();
  }, [contentTab, subtab]);

  const filteredLeagues = leagues.filter((l) => {
    const matchSearch =
      l.name?.toLowerCase().includes(leagueSearch.toLowerCase()) ||
      l.shortName?.toLowerCase().includes(leagueSearch.toLowerCase());
    const matchState = leagueState === "All States" || l.state === leagueState;
    const matchStatus = leagueStatus === "All Statuses" || (l.isActive ? "Active" : "Inactive") === leagueStatus;
    return matchSearch && matchState && matchStatus;
  });

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.name?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.organization?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchState = eventState === "All States" || e.state === eventState;
    const matchStatus = eventStatus === "All Statuses" || e.status === eventStatus;
    return matchSearch && matchState && matchStatus;
  });

  return (
    <div>
      {/* Content tabs */}
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

      {/* ── PROGRAMS ── */}
      {contentTab === "Programs" && (
        leaguesLoading ? (
          <div className={styles.empty}><div className={styles.emptyIcon}>⏳</div><div className={styles.emptyText}>Loading programs...</div></div>
        ) : (
          <>
            <div className={styles.filterBar}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input className={styles.searchInput} placeholder={`Search ${genderLabel.toLowerCase()} high school programs...`} value={leagueSearch} onChange={(e) => setLeagueSearch(e.target.value)} />
              </div>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>State</label>
                  <select className={`${styles.filter} ${styles.filterScrollable}`} value={leagueState} onChange={(e) => setLeagueState(e.target.value)}>
                    {leagueStateOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Status</label>
                  <select className={styles.filter} value={leagueStatus} onChange={(e) => setLeagueStatus(e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.resultsCount}>{filteredLeagues.length} program{filteredLeagues.length !== 1 ? "s" : ""} found</div>
            <div className={styles.grid}>
              {filteredLeagues.map((l) => {
                const gLabel = GENDER_LABEL[l.genderCategory] || l.genderCategory || "";
                const lLabel = LEVEL_LABEL[l.skillLevel] || l.skillLevel || "";
                const isActive = l.isActive !== false;
                return (
                  <div key={l.id} className={styles.card} onClick={() => navigate(`/leagues/${l.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>🏫</div>
                      <span className={styles.statusBadge} style={{ color: isActive ? "#52b788" : "#94a3b8", borderColor: isActive ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)", background: isActive ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)" }}>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className={styles.cardName}>{l.name}</div>
                    <div className={styles.cardOrg}>{l.shortName || ""}</div>
                    <div className={styles.cardTags}>
                      {gLabel && <span className={styles.cardTag}>{gLabel}</span>}
                      {lLabel && <span className={styles.cardTag}>{lLabel}</span>}
                    </div>
                    <div className={styles.cardMeta}>
                      {(l.city || l.state) && <span>📍 {[l.city, l.state].filter(Boolean).join(", ")}</span>}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFee}>{lLabel}</span>
                      <button className={styles.cardBtn} onClick={(e) => { e.stopPropagation(); navigate(`/leagues/${l.slug}`); }}>View →</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredLeagues.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No {genderLabel.toLowerCase()} high school programs found</div>
                <button className={styles.emptyReset} onClick={() => { setLeagueSearch(""); setLeagueState("All States"); setLeagueStatus("All Statuses"); }}>Reset filters</button>
              </div>
            )}
          </>
        )
      )}

      {/* ── EVENTS ── */}
      {contentTab === "Events" && (
        eventsLoading ? (
          <div className={styles.empty}><div className={styles.emptyIcon}>⏳</div><div className={styles.emptyText}>Loading events...</div></div>
        ) : (
          <>
            <div className={styles.filterBar}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input className={styles.searchInput} placeholder={`Search ${genderLabel.toLowerCase()} high school events...`} value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} />
              </div>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>State</label>
                  <select className={`${styles.filter} ${styles.filterScrollable}`} value={eventState} onChange={(e) => setEventState(e.target.value)}>
                    {eventStateOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Status</label>
                  <select className={styles.filter} value={eventStatus} onChange={(e) => setEventStatus(e.target.value)}>
                    {EVENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.resultsCount}>{filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found</div>
            <div className={styles.grid}>
              {filteredEvents.map((e) => {
                const isOpen = e.status === "Open" || e.status === "Upcoming";
                const sc = isOpen ? "#52b788" : e.status === "Filling Fast" ? "#f59e0b" : "#94a3b8";
                const sb = isOpen ? "rgba(82,183,136,0.3)" : e.status === "Filling Fast" ? "rgba(245,158,11,0.3)" : "rgba(148,163,184,0.3)";
                const sbg = isOpen ? "rgba(82,183,136,0.08)" : e.status === "Filling Fast" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.08)";
                const eventDate = e.startDate ? new Date(e.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : null;
                return (
                  <div key={e.id} className={styles.card} onClick={() => navigate(`/events/${e.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>🏫</div>
                      <span className={styles.statusBadge} style={{ color: sc, borderColor: sb, background: sbg }}>{e.status || "Upcoming"}</span>
                    </div>
                    <div className={styles.cardName}>{e.name}</div>
                    <div className={styles.cardOrg}>{e.organization || e.hostClubName || ""}</div>
                    <div className={styles.cardTags}>
                      {e.ageGroup && <span className={styles.cardTag}>{e.ageGroup}</span>}
                      {e.format && <span className={styles.cardTag}>{e.format}</span>}
                      <span className={styles.cardTag}>{genderLabel}</span>
                    </div>
                    <div className={styles.cardMeta}>
                      {(e.city || e.state) && <span>📍 {[e.city, e.state].filter(Boolean).join(", ")}</span>}
                      {eventDate && <span>📅 {eventDate}</span>}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFee}>{e.fee ? `$${e.fee}` : "Free"}</span>
                      <button className={styles.cardBtn} disabled={e.status === "Closed"} onClick={(ev) => { ev.stopPropagation(); if (e.status !== "Closed") navigate(`/events/${e.slug}`); }}>{e.status === "Closed" ? "Closed" : "View →"}</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredEvents.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No {genderLabel.toLowerCase()} high school events found</div>
                <button className={styles.emptyReset} onClick={() => { setEventSearch(""); setEventState("All States"); setEventStatus("All Statuses"); }}>Reset filters</button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
