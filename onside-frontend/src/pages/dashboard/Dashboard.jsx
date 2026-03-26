import { useSearchParams } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import OverviewSection from "./sections/OverviewSection";
import MyLeaguesSection from "./sections/MyLeaguesSection";
import MyTeamsSection from "./sections/MyTeamsSection";
import MyProfileSection from "./sections/MyProfileSection";
import styles from "./Dashboard.module.css";

const SECTIONS = {
  overview: OverviewSection,
  leagues: MyLeaguesSection,
  teams: MyTeamsSection,
  profile: MyProfileSection,
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("tab") || "overview";
  const Section = SECTIONS[active] || OverviewSection;

  function setActive(tab) {
    setSearchParams({ tab });
  }

  return (
    <div className={styles.dashboard}>
      <DashboardSidebar active={active} setActive={setActive} />
      <main className={styles.main}>
        <Section />
      </main>
    </div>
  );
}
