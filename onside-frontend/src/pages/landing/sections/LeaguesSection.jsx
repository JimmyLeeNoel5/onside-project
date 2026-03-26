import { useNavigate } from "react-router-dom";
import styles from "./FeatureSection.module.css";

export default function LeaguesSection() {
  const navigate = useNavigate();

  return (
    <section className={`${styles.feature} ${styles.featureDark}`}>
      <div className={`${styles.glowOrb} ${styles.glowOrbGreen}`} />
      <div className={`${styles.glowOrb} ${styles.glowOrbGreenBottom}`} />

      <div className={styles.innerDark}>
        <div className={styles.text}>
          <div className={styles.sectionLabelDark}>// Leagues</div>
          <div className={styles.tagDarkGreen}>Competition</div>
          <h2 className={styles.titleDark}>Find Your League</h2>
          <p className={styles.descDark}>
            Browse hundreds of leagues across every level — from professional to
            recreational, men's, women's, and youth. Filter by category, skill
            level, and location to find the perfect fit.
          </p>
          <button
            className={styles.btnDarkGreen}
            onClick={() =>
              navigate("/find", {
                state: { section: "leagues", subtab: "leagues-professional" },
              })
            }
          >
            Explore Leagues →
          </button>
        </div>

        <div className={styles.images}>
          <div className={styles.imgMainDark}>
            <img src="/images/web3.jpg" alt="League" />
          </div>
          <div className={styles.imgSecondaryDark}>
            <img src="/images/web14.jpg" alt="League match" />
          </div>
        </div>
      </div>
    </section>
  );
}
