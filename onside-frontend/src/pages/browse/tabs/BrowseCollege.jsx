import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";

const GENDER_LABEL = {
  MEN: "Men's",
  WOMEN: "Women's",
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
  "college-mens": "MEN",
  "college-womens": "WOMEN",
};

// Maps subchild id → division filter value
const DIVISION_MAP = {
  d1: "D1", d2: "D2", d3: "D3", naia: "NAIA", club: "Club",
};

const CONTENT_TABS = ["Programs", "Events"];
const STATUSES = ["All Statuses", "Active", "Inactive"];
const EVENT_STATUSES = ["All Statuses", "Upcoming", "Open", "Filling Fast", "Closed"];

export default function BrowseCollege({ subtab, division }) {
  const navigate = useNavigate();
  const [contentTab, setContentTab] = useState("Programs");
  const category = SUBTAB_GENDER_MAP[subtab];
  const divisionFilter = DIVISION_MAP[division] || null; // null = All Divisions

  // ── Programs (leagues) ─────────────────────────────────────
  const [leagues, setLeagues] = useState([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [leagueSearch, setLeagueSearch] = useState("");
  const [leagueState, setLeagueState] = useState("All States");
  const [leagueStatus, setLeagueStatus] = useState("All Statuses");

  // ── Teams ──────────────────────────────────────────────────
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsFetched, setTeamsFetched] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamState, setTeamState] = useState("All States");
  const [teamRecruiting, setTeamRecruiting] = useState("All");

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

  const teamStateOptions = useMemo(() => {
    const unique = [...new Set(teams.map((t) => t.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [teams]);

  const eventStateOptions = useMemo(() => {
    const unique = [...new Set(events.map((e) => e.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [events]);

  // Reset on subtab (gender) change
  useEffect(() => {
    setContentTab("Programs");
    setLeagueSearch(""); setLeagueState("All States"); setLeagueStatus("All Statuses");
    setTeamSearch(""); setTeamState("All States"); setTeamRecruiting("All");
    setEventSearch(""); setEventState("All States"); setEventStatus("All Statuses");
    setTeamsFetched(false); setTeams([]);
    setEventsFetched(false); setEvents([]);
  }, [subtab]);

  // Fetch programs
  useEffect(() => {
    async function fetchLeagues() {
      setLeaguesLoading(true);
      try {
        const params = new URLSearchParams({ leagueType: "COLLEGE" });
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

  // Fetch teams lazily
  useEffect(() => {
    if (contentTab !== "Teams" || teamsFetched) return;
    async function fetchTeams() {
      setTeamsLoading(true);
      try {
        const params = new URLSearchParams({ teamType: "COLLEGE" });
        if (category) params.append("category", category);
        const res = await axiosClient.get(`/teams?${params.toString()}`);
        setTeams(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTeams([]);
      } finally {
        setTeamsLoading(false);
        setTeamsFetched(true);
      }
    }
    fetchTeams();
  }, [contentTab, subtab]);

  // Fetch events lazily
  useEffect(() => {
    if (contentTab !== "Events" || eventsFetched) return;
    async function fetchEvents() {
      setEventsLoading(true);
      try {
        const params = new URLSearchParams({ eventType: "COLLEGE" });
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

  // Filter programs by division subchild
  const filteredLeagues = leagues.filter((l) => {
    const matchSearch =
      l.name?.toLowerCase().includes(leagueSearch.toLowerCase()) ||
      l.shortName?.toLowerCase().includes(leagueSearch.toLowerCase());
    const matchDivision = !divisionFilter || l.division === divisionFilter ||
      (division === "club" && l.leagueType === "CLUB");
    const matchState = leagueState === "All States" || l.state === leagueState;
    const matchStatus = leagueStatus === "All Statuses" || (l.isActive ? "Active" : "Inactive") === leagueStatus;
    return matchSearch && matchDivision && matchState && matchStatus;
  });

  const filteredTeams = teams.filter((t) => {
    const matchSearch =
      t.name?.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.clubName?.toLowerCase().includes(teamSearch.toLowerCase());
    const matchState = teamState === "All States" || t.state === teamState;
    const matchRecruiting =
      teamRecruiting === "All" ||
      (teamRecruiting === "Recruiting" && t.isRecruiting) ||
      (teamRecruiting === "Full" && !t.isRecruiting);
    return matchSearch && matchState && matchRecruiting;
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
                <input className={styles.searchInput} placeholder="Search college programs..." value={leagueSearch} onChange={(e) => setLeagueSearch(e.target.value)} />
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
                const genderLabel = GENDER_LABEL[l.genderCategory] || l.genderCategory || "";
                const levelLabel = LEVEL_LABEL[l.skillLevel] || l.skillLevel || "";
                const isActive = l.isActive !== false;
                return (
                  <div key={l.id} className={styles.card} onClick={() => navigate(`/leagues/${l.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>🎓</div>
                      <span className={styles.statusBadge} style={{ color: isActive ? "#52b788" : "#94a3b8", borderColor: isActive ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)", background: isActive ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)" }}>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className={styles.cardName}>{l.name}</div>
                    <div className={styles.cardOrg}>{l.shortName || ""}</div>
                    <div className={styles.cardTags}>
                      {genderLabel && <span className={styles.cardTag}>{genderLabel}</span>}
                      {levelLabel && <span className={styles.cardTag}>{levelLabel}</span>}
                      {l.division && <span className={styles.cardTag}>{l.division}</span>}
                    </div>
                    <div className={styles.cardMeta}>
                      {(l.city || l.state) && <span>📍 {[l.city, l.state].filter(Boolean).join(", ")}</span>}
                      {l.website && <span>🌐 {l.website}</span>}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFee}>{l.division || levelLabel}</span>
                      <button className={styles.cardBtn} onClick={(e) => { e.stopPropagation(); navigate(`/leagues/${l.slug}`); }}>View →</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredLeagues.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No college programs found</div>
                <button className={styles.emptyReset} onClick={() => { setLeagueSearch(""); setLeagueState("All States"); setLeagueStatus("All Statuses"); }}>Reset filters</button>
              </div>
            )}
          </>
        )
      )}

      {/* ── TEAMS ── */}
      {contentTab === "Teams" && (
        teamsLoading ? (
          <div className={styles.empty}><div className={styles.emptyIcon}>⏳</div><div className={styles.emptyText}>Loading teams...</div></div>
        ) : (
          <>
            <div className={styles.filterBar}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input className={styles.searchInput} placeholder="Search college teams..." value={teamSearch} onChange={(e) => setTeamSearch(e.target.value)} />
              </div>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>State</label>
                  <select className={`${styles.filter} ${styles.filterScrollable}`} value={teamState} onChange={(e) => setTeamState(e.target.value)}>
                    {teamStateOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Recruiting</label>
                  <select className={styles.filter} value={teamRecruiting} onChange={(e) => setTeamRecruiting(e.target.value)}>
                    {["All", "Recruiting", "Full"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.resultsCount}>{filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""} found</div>
            <div className={styles.grid}>
              {filteredTeams.map((t) => {
                const gLabel = GENDER_LABEL[t.genderCategory] || t.genderCategory || "";
                return (
                  <div key={t.id} className={styles.card} onClick={() => navigate(`/teams/${t.clubSlug}/${t.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>🎓</div>
                      <span className={styles.statusBadge} style={{ color: t.isRecruiting ? "#52b788" : "#94a3b8", borderColor: t.isRecruiting ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)", background: t.isRecruiting ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)" }}>{t.isRecruiting ? "Recruiting" : "Full"}</span>
                    </div>
                    <div className={styles.cardName}>{t.name}</div>
                    <div className={styles.cardOrg}>{t.clubName || t.university || ""}</div>
                    <div className={styles.cardTags}>
                      {gLabel && <span className={styles.cardTag}>{gLabel}</span>}
                      {t.division && <span className={styles.cardTag}>{t.division}</span>}
                    </div>
                    <div className={styles.cardMeta}>
                      {(t.city || t.state) && <span>📍 {[t.city, t.state].filter(Boolean).join(", ")}</span>}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFee}>{t.division || ""}</span>
                      <button className={styles.cardBtn} onClick={(e) => { e.stopPropagation(); navigate(`/teams/${t.clubSlug}/${t.slug}`); }}>View Team →</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredTeams.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No college teams found</div>
                <button className={styles.emptyReset} onClick={() => { setTeamSearch(""); setTeamState("All States"); setTeamRecruiting("All"); }}>Reset filters</button>
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
                <input className={styles.searchInput} placeholder="Search college events..." value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} />
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
                const gLabel = GENDER_LABEL[e.genderCategory] || e.genderCategory || "";
                const isOpen = e.status === "Open" || e.status === "Upcoming";
                const sc = isOpen ? "#52b788" : e.status === "Filling Fast" ? "#f59e0b" : "#94a3b8";
                const sb = isOpen ? "rgba(82,183,136,0.3)" : e.status === "Filling Fast" ? "rgba(245,158,11,0.3)" : "rgba(148,163,184,0.3)";
                const sbg = isOpen ? "rgba(82,183,136,0.08)" : e.status === "Filling Fast" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.08)";
                const eventDate = e.startDate ? new Date(e.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
                return (
                  <div key={e.id} className={styles.card} onClick={() => navigate(`/events/${e.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>📅</div>
                      <span className={styles.statusBadge} style={{ color: sc, borderColor: sb, background: sbg }}>{e.status || "Upcoming"}</span>
                    </div>
                    <div className={styles.cardName}>{e.name}</div>
                    <div className={styles.cardOrg}>{e.organization || e.hostClubName || ""}</div>
                    <div className={styles.cardTags}>
                      {gLabel && <span className={styles.cardTag}>{gLabel}</span>}
                      {e.format && <span className={styles.cardTag}>{e.format}</span>}
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
                <div className={styles.emptyText}>No college events found</div>
                <button className={styles.emptyReset} onClick={() => { setEventSearch(""); setEventState("All States"); setEventStatus("All Statuses"); }}>Reset filters</button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
