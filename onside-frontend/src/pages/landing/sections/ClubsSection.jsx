import { useNavigate } from "react-router-dom";
import styles from "./FeatureSection.module.css";

export default function ClubsSection() {
  const navigate = useNavigate();

  return (
    <section className={`${styles.feature} ${styles.featureDark}`}>
      <div className={`${styles.glowOrb} ${styles.glowOrbGreen}`} />
      <div className={`${styles.glowOrb} ${styles.glowOrbGreenBottom}`} />

      <div className={styles.innerDark}>
        <div className={styles.images}>
          <div className={styles.imgMainDark}>
            <img src="/images/web9.jpg" alt="Club" />
          </div>
          <div className={styles.imgSecondaryDark}>
            <img src="/images/web13.jpg" alt="Club match" />
          </div>
        </div>

        <div className={styles.text}>
          <div className={styles.sectionLabelDark}>// Clubs</div>
          <div className={styles.tagDarkRed}>Organization</div>
          <h2 className={styles.titleDark}>Build Your Club</h2>
          <p className={styles.descDark}>
            Create and manage your club, organize multiple teams, and recruit
            players. Manage rosters, staff, and league registrations from one
            powerful dashboard.
          </p>
          <button
            className={styles.btnDarkRed}
            onClick={() => navigate("/clubs/new")}
          >
            Start a Club →
          </button>
        </div>
      </div>
    </section>
  );
}
