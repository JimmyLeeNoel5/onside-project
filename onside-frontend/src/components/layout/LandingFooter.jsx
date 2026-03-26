import styles from "./LandingFooter.module.css";

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚽</div>
          <span className={styles.logoText}>Onside</span>
        </div>

        <nav className={styles.links}>
          <a href="#">About</a>
          <a href="#">Leagues</a>
          <a href="#">Clubs</a>
          <a href="#">Teams</a>
          <a href="#">Contact</a>
        </nav>

        <p className={styles.copy}>
          © {new Date().getFullYear()} Onside. Centralizing American Soccer.
        </p>
      </div>
    </footer>
  );
}
