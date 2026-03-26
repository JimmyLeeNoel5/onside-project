import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../../../context/AuthModalContext";
import styles from "./CtaBannerSection.module.css";

export default function CtaBannerSection() {
  const navigate = useNavigate();
  const { openRegister } = useAuthModal();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.sectionLabel}>For coaches & organizers</div>
          <h2 className={styles.title}>
            Host Your Event
            <br />
            or List Your Team
          </h2>
          <p className={styles.sub}>
            Reach thousands of players across the country. Create tournaments,
            manage registrations, and grow your program — all in one place.
          </p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={openRegister}>
              Create Your Free Account
            </button>
            <button
              className={styles.btnGhost}
              onClick={() => navigate("/find", { state: { section: "teams" } })}
            >
              List Your Team
            </button>
          </div>
        </div>

        {/* Decorative ball */}
        <div className={styles.decorBall}>⚽</div>
      </div>
    </section>
  );
}
