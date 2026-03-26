import { useNavigate } from "react-router-dom";
import styles from "./FeatureSection.module.css";

export default function TeamsSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.feature}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <div className={styles.sectionLabel}>// Teams</div>
          <span className={styles.tag}>Roster</span>
          <h2 className={styles.title}>
            Play With
            <br />
            Purpose
          </h2>
          <p className={styles.desc}>
            Join a team that matches your skill level, location, and schedule.
            Teams recruiting players are highlighted — find your next squad in
            minutes.
          </p>
          <button
            className={styles.btn}
            onClick={() =>
              navigate("/find", {
                state: { section: "teams" },
              })
            }
          >
            Find a Team →
          </button>
        </div>

        <div className={styles.images}>
          <div className={styles.imgMain}>
            <img src="/images/web31.png" alt="Team match" />
          </div>
          <div className={styles.imgSecondary}>
            <img src="/images/web23.jpg" alt="Team match" />
          </div>
        </div>
      </div>
    </section>
  );
}
