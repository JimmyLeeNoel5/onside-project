import { useAuthModal } from "../../context/AuthModalContext";
import LandingNav from "../../components/layout/LandingNav";
import LandingFooter from "../../components/layout/LandingFooter";
import HeroSection from "./sections/HeroSection";
import MarqueeSection from "./sections/MarqueeSection";
import CategorySection from "./sections/CategorySection"; // ← new
import LeaguesSection from "./sections/LeaguesSection";
import ClubsSection from "./sections/ClubsSection";
import TeamsSection from "./sections/TeamsSection";
import OrganizationsSection from "./sections/OrganizationsSection";
import CtaBannerSection from "./sections/CtaBannerSection";
import styles from "./Landing.module.css";

export default function Landing() {
  const { openLogin, openRegister } = useAuthModal();

  return (
    <div className={styles.page}>
      <LandingNav />
      <main>
        <HeroSection onLogin={openLogin} onRegister={openRegister} />
        <MarqueeSection />
        <CategorySection onRegister={openRegister} /> {/* ← new */}
        <LeaguesSection onRegister={openRegister} />
        <ClubsSection onRegister={openRegister} />
        <TeamsSection onRegister={openRegister} />
        <OrganizationsSection />
        <CtaBannerSection onRegister={openRegister} />
      </main>
      <LandingFooter />
    </div>
  );
}
