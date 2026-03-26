import { useState } from "react";
import styles from "./HeroSection.module.css";

export default function HeroSection({ onLogin, onRegister }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className={styles.hero}>
      {/* Background photo */}
      <div className={styles.bg}>
        <img src="/images/web26.png" alt="" className={styles.bgImg} />
        <div className={styles.bgOverlay} />
      </div>

      {/* Field line grid texture */}
      <div className={styles.fieldLines} />

      {/* Glow orbs */}
      <div className={`${styles.glowOrb} ${styles.glowOrbTop}`} />
      <div className={`${styles.glowOrb} ${styles.glowOrbBottom}`} />

      {/* Decorative circles */}
      <div className={styles.circleOuter} />
      <div className={styles.circleMiddle} />
      <div className={styles.circleInner}>
        <span className={styles.circleBall} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Live indicator */}
        <div className={styles.liveRow}>
          <div className={styles.liveDot} />
          <span className={styles.liveText}>Live events near you</span>
        </div>

        {/* Title */}
        <h1 className={styles.title}>
          YOUR
          <br />
          SOCCER
          <br />
          UNIVERSE
        </h1>

        <p className={styles.sub}>
          From pickup games to professional leagues — discover teams, events,
          and the entire American soccer ecosystem in one place.
        </p>

        {/* Search bar */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search events, teams, leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.searchBtn}>Search</button>
        </div>

        {/* Quick filter tags */}
        <div className={styles.quickFilters}>
          {["Near me", "This weekend", "Youth U12", "Adult Rec", "Pickup"].map(
            (tag) => (
              <button key={tag} className={styles.filterTag}>
                {tag}
              </button>
            ),
          )}
        </div>

        {/* Stats strip */}
        <div className={styles.stats}>
          {[
            ["500+", "Leagues"],
            ["2,000+", "Clubs"],
            ["10,000+", "Players"],
            ["48", "States"],
          ].map(([num, label]) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statNum}>{num}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
