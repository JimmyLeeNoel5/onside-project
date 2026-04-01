import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";

const GENDER_LABEL = {
  MEN: "Men's",
  WOMEN: "Women's",
  YOUTH_BOYS: "Youth Boys",
  YOUTH_GIRLS: "Youth Girls",
  COED: "Co-Ed",
  OPEN: "Open",
};

const LEAGUE_TYPE_LABEL = {
  PROFESSIONAL: "Professional",
  SEMI_PRO: "Semi-Pro",
  AMATEUR: "Amateur",
  RECREATIONAL: "Recreational",
  COLLEGE: "College",
  HIGH_SCHOOL: "High School",
  YOUTH: "Youth",
  INDOOR: "Indoor",
  OTHER: "Other",
};

const SUBTAB_GENDER_MAP = {
  "leagues-mens": "MEN",
  "leagues-womens": "WOMEN",
};

const SUBCHILD_TAB_MAP = {
  leagues: "Leagues",
  teams: "Teams",
  tournaments: "Tournaments",
};

const CONTENT_TABS = ["Leagues", "Teams", "Events"];
const STATUSES = ["All Statuses", "Active", "Inactive"];
const EVENT_STATUSES = ["All Statuses", "Upcoming", "Open", "Filling Fast", "Closed"];
const LEVELS = ["All Levels", "Professional", "Semi-Pro", "Amateur", "Recreational", "College", "High School", "Youth", "Indoor", "Other"];

export default function BrowseLeagues({ subtab, subchild, initialTab }) {
  const navigate = useNavigate();
  const isFirstMount = useRef(true);
  const [contentTab, setContentTab] = useState(initialTab || "Leagues");
  const category = SUBTAB_GENDER_MAP[subtab];
  const isTournaments = subchild === "tournaments";

  // ── Tournaments ────────────────────────────────────────────
  const [tournaments, setTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [tournamentsFetched, setTournamentsFetched] = useState(false);
  const [tournamentSearch, setTournamentSearch] = useState("");
  const [tournamentState, setTournamentState] = useState("All States");
  const [tournamentStatus, setTournamentStatus] = useState("All Statuses");

  const tournamentStateOptions = useMemo(() => {
    const unique = [...new Set(tournaments.map((t) => t.state).filter(Boolean))].sort();
    return ["All States", ...unique];
  }, [tournaments]);

  // ── Leagues ────────────────────────────────────────────────
  const [leagues, setLeagues] = useState([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [leaguesError, setLeaguesError] = useState(null);
  const [leagueSearch, setLeagueSearch] = useState("");
  const [leagueState, setLeagueState] = useState("All States");
  const [leagueStatus, setLeagueStatus] = useState("All Statuses");
  const [leagueLevel, setLeagueLevel] = useState("All Levels");

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
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    setContentTab("Leagues");
    setLeagueSearch(""); setLeagueState("All States"); setLeagueStatus("All Statuses"); setLeagueLevel("All Levels");
    setTeamSearch(""); setTeamState("All States"); setTeamRecruiting("All");
    setEventSearch(""); setEventState("All States"); setEventStatus("All Statuses");
    setTeamsFetched(false); setTeams([]);
    setEventsFetched(false); setEvents([]);
    setTournamentSearch(""); setTournamentState("All States"); setTournamentStatus("All Statuses");
    setTournamentsFetched(false); setTournaments([]);
  }, [subtab]);

  // Switch content tab when sidebar subchild changes
  useEffect(() => {
    const tab = SUBCHILD_TAB_MAP[subchild];
    if (tab) setContentTab(tab);
  }, [subchild]);

  // Fetch tournaments when Tournaments subchild is selected
  useEffect(() => {
    if (!isTournaments || tournamentsFetched) return;
    async function fetchTournaments() {
      setTournamentsLoading(true);
      try {
        const params = new URLSearchParams({ eventType: "TOURNAMENT" });
        if (category) params.set("category", category);
        const res = await axiosClient.get(`/events?${params.toString()}`);
        setTournaments(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTournaments([]);
      } finally {
        setTournamentsLoading(false);
        setTournamentsFetched(true);
      }
    }
    fetchTournaments();
  }, [isTournaments, subtab]);

  // Fetch leagues
  useEffect(() => {
    async function fetchLeagues() {
      setLeaguesLoading(true);
      setLeaguesError(null);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        const res = await axiosClient.get(`/leagues?${params.toString()}`);
        setLeagues(Array.isArray(res.data) ? res.data : []);
      } catch {
        setLeaguesError("Failed to load leagues. Please try again.");
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
        const params = new URLSearchParams();
        if (category) params.set("category", category);
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
        const params = new URLSearchParams({ eventType: "LEAGUE" });
        if (category) params.set("category", category);
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
    const leagueStatusVal = l.isActive ? "Active" : "Inactive";
    const levelLabel = LEAGUE_TYPE_LABEL[l.leagueType] || l.leagueType || "";
    const matchSearch =
      l.name?.toLowerCase().includes(leagueSearch.toLowerCase()) ||
      l.shortName?.toLowerCase().includes(leagueSearch.toLowerCase());
    const matchState = leagueState === "All States" || l.state === leagueState;
    const matchStatus = leagueStatus === "All Statuses" || leagueStatusVal === leagueStatus;
    const matchLevel = leagueLevel === "All Levels" || levelLabel === leagueLevel;
    return matchSearch && matchState && matchStatus && matchLevel;
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

  const filteredTournaments = tournaments.filter((t) => {
    const matchSearch =
      t.name?.toLowerCase().includes(tournamentSearch.toLowerCase()) ||
      t.organization?.toLowerCase().includes(tournamentSearch.toLowerCase());
    const matchState = tournamentState === "All States" || t.state === tournamentState;
    const matchStatus = tournamentStatus === "All Statuses" || t.status === tournamentStatus;
    return matchSearch && matchState && matchStatus;
  });

  // ── Tournaments view (no tabs) ──────────────────────────────
  if (isTournaments) {
    return (
      <div>
        {tournamentsLoading ? (
          <div className={styles.empty}><div className={styles.emptyIcon}>⏳</div><div className={styles.emptyText}>Loading tournaments...</div></div>
        ) : (
          <>
            <div className={styles.filterBar}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input className={styles.searchInput} placeholder="Search tournaments..." value={tournamentSearch} onChange={(e) => setTournamentSearch(e.target.value)} />
              </div>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>State</label>
                  <select className={`${styles.filter} ${styles.filterScrollable}`} value={tournamentState} onChange={(e) => setTournamentState(e.target.value)}>
                    {tournamentStateOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Status</label>
                  <select className={styles.filter} value={tournamentStatus} onChange={(e) => setTournamentStatus(e.target.value)}>
                    {EVENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.resultsCount}>{filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? "s" : ""} found</div>
            <div className={styles.grid}>
              {filteredTournaments.map((t) => {
                const gLabel = GENDER_LABEL[t.genderCategory] || t.genderCategory || "";
                const isOpen = t.status === "Open" || t.status === "Upcoming";
                const sc = isOpen ? "#52b788" : t.status === "Filling Fast" ? "#f59e0b" : "#94a3b8";
                const sb = isOpen ? "rgba(82,183,136,0.3)" : t.status === "Filling Fast" ? "rgba(245,158,11,0.3)" : "rgba(148,163,184,0.3)";
                const sbg = isOpen ? "rgba(82,183,136,0.08)" : t.status === "Filling Fast" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.08)";
                const eventDate = t.startDate ? new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
                return (
                  <div key={t.id} className={styles.card} onClick={() => navigate(`/events/${t.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>🏆</div>
                      <span className={styles.statusBadge} style={{ color: sc, borderColor: sb, background: sbg }}>{t.status || "Upcoming"}</span>
                    </div>
                    <div className={styles.cardName}>{t.name}</div>
                    <div className={styles.cardOrg}>{t.organization || t.hostClubName || ""}</div>
                    <div className={styles.cardTags}>
                      {gLabel && <span className={styles.cardTag}>{gLabel}</span>}
                      {t.format && <span className={styles.cardTag}>{t.format}</span>}
                    </div>
                    <div className={styles.cardMeta}>
                      {(t.city || t.state) && <span>📍 {[t.city, t.state].filter(Boolean).join(", ")}</span>}
                      {eventDate && <span>📅 {eventDate}</span>}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFee}>{t.fee ? `$${t.fee}` : "Free"}</span>
                      <button className={styles.cardBtn} disabled={t.status === "Closed"} onClick={(ev) => { ev.stopPropagation(); if (t.status !== "Closed") navigate(`/events/${t.slug}`); }}>{t.status === "Closed" ? "Closed" : "View →"}</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredTournaments.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No tournaments found</div>
                <button className={styles.emptyReset} onClick={() => { setTournamentSearch(""); setTournamentState("All States"); setTournamentStatus("All Statuses"); }}>Reset filters</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

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

      {/* ── LEAGUES ── */}
      {contentTab === "Leagues" && (
        leaguesLoading ? (
          <div className={styles.empty}><div className={styles.emptyIcon}>⏳</div><div className={styles.emptyText}>Loading leagues...</div></div>
        ) : leaguesError ? (
          <div className={styles.empty}><div className={styles.emptyIcon}>⚠️</div><div className={styles.emptyText}>{leaguesError}</div><button className={styles.emptyReset} onClick={() => window.location.reload()}>Try again</button></div>
        ) : (
          <>
            <div className={styles.filterBar}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input className={styles.searchInput} placeholder="Search leagues..." value={leagueSearch} onChange={(e) => setLeagueSearch(e.target.value)} />
              </div>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Level</label>
                  <select className={styles.filter} value={leagueLevel} onChange={(e) => setLeagueLevel(e.target.value)}>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
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
            <div className={styles.resultsCount}>{filteredLeagues.length} league{filteredLeagues.length !== 1 ? "s" : ""} found</div>
            <div className={styles.grid}>
              {filteredLeagues.map((l) => {
                const genderLabel = GENDER_LABEL[l.genderCategory] || l.genderCategory || "";
                const levelLabel = LEAGUE_TYPE_LABEL[l.leagueType] || l.leagueType || "";
                const isActive = l.isActive !== false;
                return (
                  <div key={l.id} className={styles.card} onClick={() => navigate(`/leagues/${l.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>🏆</div>
                      <span className={styles.statusBadge} style={{ color: isActive ? "#52b788" : "#94a3b8", borderColor: isActive ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)", background: isActive ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)" }}>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className={styles.cardName}>{l.name}</div>
                    <div className={styles.cardOrg}>{l.shortName || ""}</div>
                    <div className={styles.cardTags}>
                      {levelLabel && <span className={styles.cardTag}>{levelLabel}</span>}
                      {genderLabel && <span className={styles.cardTag}>{genderLabel}</span>}
                      {l.foundedYear && <span className={styles.cardTag}>Est. {l.foundedYear}</span>}
                    </div>
                    <div className={styles.cardMeta}>
                      {(l.city || l.state) && <span>📍 {[l.city, l.state].filter(Boolean).join(", ")}</span>}
                      {l.website && <span>🌐 {l.website}</span>}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFee}>{levelLabel}</span>
                      <button className={styles.cardBtn} onClick={(e) => { e.stopPropagation(); navigate(`/leagues/${l.slug}`); }}>View League →</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredLeagues.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No leagues match your filters</div>
                <button className={styles.emptyReset} onClick={() => { setLeagueSearch(""); setLeagueState("All States"); setLeagueStatus("All Statuses"); setLeagueLevel("All Levels"); }}>Reset filters</button>
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
                <input className={styles.searchInput} placeholder="Search teams, clubs..." value={teamSearch} onChange={(e) => setTeamSearch(e.target.value)} />
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
                const lLabel = LEAGUE_TYPE_LABEL[t.leagueType] || t.leagueType || "";
                return (
                  <div key={t.id} className={styles.card} onClick={() => navigate(`/teams/${t.clubSlug}/${t.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>👥</div>
                      <span className={styles.statusBadge} style={{ color: t.isRecruiting ? "#52b788" : "#94a3b8", borderColor: t.isRecruiting ? "rgba(82,183,136,0.3)" : "rgba(148,163,184,0.3)", background: t.isRecruiting ? "rgba(82,183,136,0.08)" : "rgba(148,163,184,0.08)" }}>{t.isRecruiting ? "Recruiting" : "Full"}</span>
                    </div>
                    <div className={styles.cardName}>{t.name}</div>
                    <div className={styles.cardOrg}>{t.clubName || ""}</div>
                    <div className={styles.cardTags}>
                      {gLabel && <span className={styles.cardTag}>{gLabel}</span>}
                      {lLabel && <span className={styles.cardTag}>{lLabel}</span>}
                    </div>
                    <div className={styles.cardMeta}>
                      {(t.city || t.state) && <span>📍 {[t.city, t.state].filter(Boolean).join(", ")}</span>}
                      {t.leagueName && <span>🏆 {t.leagueName}</span>}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFee}>{lLabel || "—"}</span>
                      <button className={styles.cardBtn} onClick={(e) => { e.stopPropagation(); navigate(`/teams/${t.clubSlug}/${t.slug}`); }}>View Team →</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredTeams.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No teams found</div>
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
                <input className={styles.searchInput} placeholder="Search events..." value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} />
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
                const statusColor = isOpen ? "#52b788" : e.status === "Filling Fast" ? "#f59e0b" : "#94a3b8";
                const statusBorder = isOpen ? "rgba(82,183,136,0.3)" : e.status === "Filling Fast" ? "rgba(245,158,11,0.3)" : "rgba(148,163,184,0.3)";
                const statusBg = isOpen ? "rgba(82,183,136,0.08)" : e.status === "Filling Fast" ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.08)";
                const eventDate = e.startDate ? new Date(e.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
                return (
                  <div key={e.id} className={styles.card} onClick={() => navigate(`/events/${e.slug}`)}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>📅</div>
                      <span className={styles.statusBadge} style={{ color: statusColor, borderColor: statusBorder, background: statusBg }}>{e.status || "Upcoming"}</span>
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
                <div className={styles.emptyText}>No upcoming events found</div>
                <button className={styles.emptyReset} onClick={() => { setEventSearch(""); setEventState("All States"); setEventStatus("All Statuses"); }}>Reset filters</button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
