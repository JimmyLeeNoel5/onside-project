import { useNavigate } from "react-router-dom";
import styles from "./DashboardSidebar.module.css";
import useAuth from "../../hooks/useAuth";

const ADMIN_ROLES = ["SUPER_ADMIN", "LEAGUE_ADMIN", "TEAM_MANAGER", "COACH"];

const NAV = [
  {
    group: "Main",
    items: [
      { id: "overview", label: "Overview", icon: OverviewIcon },
      { id: "leagues", label: "My Leagues", icon: LeagueIcon },
      { id: "teams", label: "My Teams", icon: TeamIcon },
    ],
  },
  {
    group: "Account",
    items: [{ id: "profile", label: "My Profile", icon: ProfileIcon }],
  },
];

export default function DashboardSidebar({ active, setActive }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Player";

  // Show the admin switcher only if the user has at least one admin role
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));

  return (
    <aside className={styles.sidebar}>
      {/* Logo — clicking navigates to the landing page */}
      <button className={styles.logo} onClick={() => navigate("/")}>
        <div className={styles.logoIcon}>⚽</div>
        <span className={styles.logoText}>Onside</span>
      </button>

      {/* Admin switcher — only shown for users with an admin role */}
      {isAdmin && (
        <button className={styles.switchBtn} onClick={() => navigate("/admin")}>
          <AdminIcon />
          <span>Switch to Admin</span>
        </button>
      )}

      {/* Nav groups */}
      <nav className={styles.nav}>
        {NAV.map((group) => (
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
            <div className={styles.userRole}>
              {isAdmin ? "Player / Admin" : "Player"}
            </div>
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
function LeagueIcon() {
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
function ProfileIcon() {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
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
function AdminIcon() {
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
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
