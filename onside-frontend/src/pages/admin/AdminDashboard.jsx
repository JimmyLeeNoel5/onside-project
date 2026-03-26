import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AdminSidebar from "./AdminSidebar";
import AdminOverviewSection from "./sections/AdminOverviewSection";
import ManageClubSection from "./sections/ManageClubSection";
import ManageTeamsSection from "./sections/ManageTeamsSection";
import ManageEventsSection from "./sections/ManageEventsSection";
import EventRegistrationsSection from "./sections/EventRegistrationsSection";
import ManageSeasonsSection from "./sections/ManageSeasonsSection";
import ManageStaffSection from "./sections/ManageStaffSection";
import StandingsSection from "./sections/StandingsSection";
import styles from "./AdminDashboard.module.css";

// Roles that can access the admin dashboard.
// These match the actual PostgreSQL user_role enum values:
//   BASIC_USER, COACH, TEAM_MANAGER, LEAGUE_ADMIN, SUPER_ADMIN
const ADMIN_ROLES = ["SUPER_ADMIN", "LEAGUE_ADMIN", "TEAM_MANAGER", "COACH"];

const SECTIONS = {
  overview: AdminOverviewSection,
  club: ManageClubSection,
  teams: ManageTeamsSection,
  events: ManageEventsSection,
  registrations: EventRegistrationsSection,
  seasons: ManageSeasonsSection,
  staff: ManageStaffSection,
  standings: StandingsSection,
};

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [active, setActive] = useState("overview");

  // Wait for auth to resolve before checking roles
  if (isLoading) return null;

  // Redirect non-admin users back to the player dashboard
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const Section = SECTIONS[active] || AdminOverviewSection;

  return (
    <div className={styles.dashboard}>
      <AdminSidebar active={active} setActive={setActive} user={user} />
      <main className={styles.main}>
        <Section />
      </main>
    </div>
  );
}
