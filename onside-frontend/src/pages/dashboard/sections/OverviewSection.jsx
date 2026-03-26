import useAuth from "../../../hooks/useAuth";
import styles from "./DashSection.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — stats, activity, and upcoming matches are still hardcoded.
// These will stay mock until the following backend endpoints are built:
//   - GET /users/me/stats         → leagues joined, teams, matches played, goals
//   - GET /users/me/activity      → recent activity feed
//   - GET /users/me/upcoming      → upcoming matches
//
// When those endpoints exist, replace each const below with a useEffect +
// axiosClient.get() call, just like BrowseLeagues and MyTeamsSection.
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Leagues Joined", value: "3", sub: "2 active", color: "#40916c" },
  { label: "Teams", value: "2", sub: "1 recruiting", color: "#3b82f6" },
  {
    label: "Matches Played",
    value: "24",
    sub: "this season",
    color: "#f59e0b",
  },
  { label: "Goals", value: "7", sub: "4 assists", color: "#e63946" },
];

const ACTIVITY = [
  {
    text: "Your team FC Decatur won 3–1 vs Piedmont FC",
    time: "2 hours ago",
    dot: "#40916c",
  },
  {
    text: "Spring Adult League registration is now open",
    time: "Yesterday",
    dot: "#3b82f6",
  },
  {
    text: "Coach Marcus posted a new training session",
    time: "2 days ago",
    dot: "#f59e0b",
  },
  {
    text: "Upcoming match vs North Atlanta SC on Saturday",
    time: "3 days ago",
    dot: "#e63946",
  },
  {
    text: "You were added to Indoor Futsal League",
    time: "1 week ago",
    dot: "#40916c",
  },
];

const UPCOMING = [
  {
    opponent: "North Atlanta SC",
    date: "Mar 14",
    time: "10:00 AM",
    venue: "Piedmont Park Field 3",
    league: "Adult Men's Rec",
  },
  {
    opponent: "East Side United",
    date: "Mar 21",
    time: "2:00 PM",
    venue: "Grant Park Soccer Complex",
    league: "Adult Men's Rec",
  },
  {
    opponent: "Decatur FC B",
    date: "Mar 29",
    time: "11:00 AM",
    venue: "Oakhurst Park",
    league: "Spring Futsal",
  },
];

// Returns a greeting based on the current hour — no imports needed
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function OverviewSection() {
  // useAuth gives us the logged-in user object.
  // We use user.firstName to personalize the greeting instead of hardcoding "Jimmy".
  // If firstName isn't available (e.g. still loading), we fall back to "there".
  const { user } = useAuth();
  const firstName = user?.firstName || "there";

  return (
    <div className={styles.section}>
      {/* ── Header ────────────────────────────────────────────────────────────
          Greeting is dynamic (time-aware + real first name).
          Season badge is still hardcoded — update when season data is available.
      ────────────────────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>
            {getGreeting()}, {firstName} 👋
          </div>
          <h1 className={styles.title}>Overview</h1>
        </div>
        <span className={styles.badge}>Spring 2025 Season</span>
      </div>

      {/* ── Stats grid — mock data ─────────────────────────────────────────────
          4 stat cards. Each has a value, label, and sub-label.
          Color is applied inline to the value for visual variety.
      ────────────────────────────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue} style={{ color: s.color }}>
              {s.value}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────────
          Left: activity feed | Right: upcoming matches
          Both are still mock data.
      ────────────────────────────────────────────────────────────────────────── */}
      <div className={styles.twoCol}>
        {/* Activity feed — mock data */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Recent Activity</div>
          </div>
          <div className={styles.feed}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className={styles.feedItem}>
                {/* Colored dot indicates the category of the activity */}
                <div className={styles.feedDot} style={{ background: a.dot }} />
                <div className={styles.feedContent}>
                  <div className={styles.feedText}>{a.text}</div>
                  <div className={styles.feedTime}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming matches — mock data */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Upcoming Matches</div>
          </div>
          <div className={styles.matchList}>
            {UPCOMING.map((m, i) => (
              <div key={i} className={styles.matchItem}>
                {/* Date split into day number and month abbreviation */}
                <div className={styles.matchDate}>
                  <div className={styles.matchDay}>{m.date.split(" ")[1]}</div>
                  <div className={styles.matchMonth}>
                    {m.date.split(" ")[0]}
                  </div>
                </div>
                <div className={styles.matchInfo}>
                  <div className={styles.matchOpponent}>vs {m.opponent}</div>
                  <div className={styles.matchMeta}>
                    {m.time} · {m.venue}
                  </div>
                  <div className={styles.matchLeague}>{m.league}</div>
                </div>
                <div className={styles.matchChevron}>›</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
