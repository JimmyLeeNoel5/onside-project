import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import styles from "./AdminSidebar.module.css";

const NAV = [
  {
    group: "Admin",
    items: [{ id: "overview", label: "Overview", icon: OverviewIcon }],
  },
  {
    group: "Club Management",
    roles: ["SUPER_ADMIN", "TEAM_MANAGER"],
    items: [
      { id: "club", label: "Club Profile", icon: ClubIcon },
      { id: "teams", label: "Teams & Rosters", icon: TeamIcon },
      { id: "staff", label: "Staff", icon: StaffIcon },
    ],
  },
  {
    group: "Events",
    items: [
      { id: "events", label: "Manage Events", icon: EventIcon },
      { id: "registrations", label: "Registrations", icon: RegistrationsIcon },
    ],
  },
  {
    group: "League",
    roles: ["SUPER_ADMIN", "LEAGUE_ADMIN"],
    items: [
      { id: "seasons", label: "Seasons", icon: SeasonsIcon },
      { id: "standings", label: "Standings", icon: StandingsIcon },
    ],
  },
];

export default function AdminSidebar({ active, setActive, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "Admin";

  const roleLabel = user?.roles?.includes("SUPER_ADMIN")
    ? "Super Admin"
    : user?.roles?.includes("LEAGUE_ADMIN")
      ? "League Admin"
      : user?.roles?.includes("TEAM_MANAGER")
        ? "Team Manager"
        : user?.roles?.includes("COACH")
          ? "Coach"
          : "Admin";

  const visibleNav = NAV.filter((group) => {
    if (!group.roles) return true;
    return group.roles.some((r) => user?.roles?.includes(r));
  });

  return (
    <aside className={styles.sidebar}>
      {/* Logo — clicking navigates to the landing page */}
      <button className={styles.logo} onClick={() => navigate("/")}>
        <div className={styles.logoIcon}>⚽</div>
        <div>
          <span className={styles.logoText}>Onside</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>
      </button>

      {/* Switch to player dashboard */}
      <button
        className={styles.switchBtn}
        onClick={() => navigate("/dashboard")}
      >
        <span>← Player Dashboard</span>
      </button>

      {/* Nav groups */}
      <nav className={styles.nav}>
        {visibleNav.map((group) => (
          <div key={group.group} className={styles.group}>
            <div className={styles.groupLabel}>{group.group}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ""}`}
                  onClick={() => setActive(item.id)}
                >
                  <span className={styles.navIcon}>
                    <Icon />
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {active === item.id && <span className={styles.activeBar} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userChip}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{fullName}</div>
            <div className={styles.userRole}>{roleLabel}</div>
          </div>
        </div>
        <button className={styles.logoutBtn} title="Sign out" onClick={logout}>
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────────── */
function OverviewIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ClubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M3 21v-2a5 5 0 015-5h4a5 5 0 015 5v2" />
      <path d="M19 11a3 3 0 010 6" />
    </svg>
  );
}
function StaffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function EventIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function RegistrationsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function SeasonsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8M12 17v4M7 4H5a2 2 0 00-2 2v3c0 3.31 2.69 6 6 6h6c3.31 0 6-2.69 6-6V6a2 2 0 00-2-2h-2M7 4V2m10 2V2M7 4h10" />
    </svg>
  );
}
function StandingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
