import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BrowseTab.module.css";

const TOURNAMENTS = [
  {
    id: 1,
    // slug is what gets passed to /events/:slug — derived from the event name.
    // When you connect real API data, this will come from event.slug directly.
    slug: "atlanta-spring-classic",
    name: "Atlanta Spring Classic",
    org: "Atlanta Soccer Federation",
    level: "Amateur",
    gender: "Men's",
    date: "Apr 12–13",
    location: "Atlanta, GA",
    teams: 16,
    status: "Open",
    prize: "Trophy + $500",
    format: "7v7",
  },
  {
    id: 2,
    slug: "decatur-cup-2025",
    name: "Decatur Cup 2025",
    org: "Decatur FC",
    level: "Competitive",
    gender: "Co-Ed",
    date: "May 3–4",
    location: "Decatur, GA",
    teams: 12,
    status: "Open",
    prize: "Trophy",
    format: "11v11",
  },
  {
    id: 3,
    slug: "youth-spring-showdown",
    name: "Youth Spring Showdown",
    org: "Georgia Youth Soccer",
    level: "Youth",
    gender: "Boys",
    date: "Apr 19–20",
    location: "Marietta, GA",
    teams: 24,
    status: "Filling Fast",
    prize: "Medals",
    format: "9v9",
  },
  {
    id: 4,
    slug: "inman-park-futsal-cup",
    name: "Inman Park Futsal Cup",
    org: "Inman Soccer Club",
    level: "Recreational",
    gender: "Co-Ed",
    date: "Mar 29",
    location: "Atlanta, GA",
    teams: 8,
    status: "Open",
    prize: "Trophy",
    format: "Futsal",
  },
  {
    id: 5,
    slug: "atl-elite-invitational",
    name: "ATL Elite Invitational",
    org: "Elite Soccer ATL",
    level: "Competitive",
    gender: "Men's",
    date: "Jun 7–8",
    location: "Alpharetta, GA",
    teams: 16,
    status: "Closed",
    prize: "Trophy + $1000",
    format: "11v11",
  },
];

const LEVELS = ["All", "Recreational", "Amateur", "Competitive", "Youth"];
const GENDERS = ["All", "Men's", "Women's", "Co-Ed", "Boys", "Girls"];
const FORMATS = ["All", "11v11", "7v7", "9v9", "Futsal"];

export default function BrowseTournaments() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [gender, setGender] = useState("All");
  const [format, setFormat] = useState("All");

  const filtered = TOURNAMENTS.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === "All" || t.level === level;
    const matchGender = gender === "All" || t.gender === gender;
    const matchFormat = format === "All" || t.format === format;
    return matchSearch && matchLevel && matchGender && matchFormat;
  });

  // Navigates to the event detail page using the event's slug.
  // The "Register →" button click is stopped from bubbling up to the card
  // so both can coexist — clicking the card goes to the detail page,
  // clicking "Register →" also goes to the detail page for now.
  function handleCardClick(slug) {
    navigate(`/events/${slug}`);
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
            placeholder="Search tournaments, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select
            className={styles.filter}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            className={styles.filter}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            {GENDERS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <select
            className={styles.filter}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {FORMATS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className={styles.resultsCount}>
        {filtered.length} tournament{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* Card grid */}
      <div className={styles.grid}>
        {filtered.map((t) => (
          // Clicking anywhere on the card navigates to the event detail page
          <div
            key={t.id}
            className={styles.card}
            onClick={() => handleCardClick(t.slug)}
          >
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>🥇</div>
              <span
                className={styles.statusBadge}
                style={{
                  color:
                    t.status === "Open"
                      ? "#52b788"
                      : t.status === "Filling Fast"
                        ? "#f59e0b"
                        : "#94a3b8",
                  borderColor:
                    t.status === "Open"
                      ? "rgba(82,183,136,0.3)"
                      : t.status === "Filling Fast"
                        ? "rgba(245,158,11,0.3)"
                        : "rgba(148,163,184,0.3)",
                  background:
                    t.status === "Open"
                      ? "rgba(82,183,136,0.08)"
                      : t.status === "Filling Fast"
                        ? "rgba(245,158,11,0.08)"
                        : "rgba(148,163,184,0.08)",
                }}
              >
                {t.status}
              </span>
            </div>

            <div className={styles.cardName}>{t.name}</div>
            <div className={styles.cardOrg}>{t.org}</div>

            <div className={styles.cardTags}>
              <span className={styles.cardTag}>{t.level}</span>
              <span className={styles.cardTag}>{t.gender}</span>
              <span className={styles.cardTag}>{t.format}</span>
            </div>

            <div className={styles.cardMeta}>
              <span>📍 {t.location}</span>
              <span>📅 {t.date}</span>
            </div>

            <div className={styles.cardMeta} style={{ marginTop: "0.35rem" }}>
              <span>👥 {t.teams} teams</span>
              <span>🏅 {t.prize}</span>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.cardFee}>{t.format}</span>
              <button
                className={styles.cardBtn}
                disabled={t.status === "Closed"}
                // e.stopPropagation() prevents the button click from also
                // triggering the card's onClick — both do the same thing for
                // now, but this keeps them independent for when you wire up
                // a separate "quick register" flow later.
                onClick={(e) => {
                  e.stopPropagation();
                  if (t.status !== "Closed") handleCardClick(t.slug);
                }}
              >
                {t.status === "Closed" ? "Closed" : "Register →"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <div className={styles.emptyText}>
            No tournaments match your filters
          </div>
          <button
            className={styles.emptyReset}
            onClick={() => {
              setSearch("");
              setLevel("All");
              setGender("All");
              setFormat("All");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
