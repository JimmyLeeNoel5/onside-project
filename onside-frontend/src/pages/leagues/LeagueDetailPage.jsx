import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import styles from "./LeagueDetailPage.module.css";

// Maps GenderCategory enum values to readable labels
const GENDER_LABELS = {
  MALE: "Men's",
  FEMALE: "Women's",
  COED: "Co-Ed",
  OPEN: "Open",
};

// Maps SkillLevel enum values to readable labels
const LEVEL_LABELS = {
  RECREATIONAL: "Recreational",
  INTERMEDIATE: "Intermediate",
  COMPETITIVE: "Competitive",
  ELITE: "Elite",
  SEMI_PRO: "Semi-Pro",
  PROFESSIONAL: "Professional",
};

// Small info row used in the details grid
function InfoRow({ icon, label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoIcon}>{icon}</span>
      <div className={styles.infoText}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    </div>
  );
}

export default function LeagueDetailPage() {
  // Pull the slug from the URL: /leagues/:slug
  const { slug } = useParams();
  const navigate = useNavigate();

  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch league from GET /leagues/:slug (public endpoint)
  useEffect(() => {
    async function fetchLeague() {
      try {
        const res = await axiosClient.get(`/leagues/${slug}`);
        setLeague(res.data);
      } catch {
        setError("League not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeague();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading league...</p>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className={styles.errorWrap}>
        <h2>League not found</h2>
        <button className={styles.backBtn} onClick={() => navigate("/find")}>
          Back to Browse
        </button>
      </div>
    );
  }

  // Convert enum values to readable labels
  const genderLabel =
    GENDER_LABELS[league.genderCategory] || league.genderCategory || "";
  const levelLabel = LEVEL_LABELS[league.skillLevel] || league.skillLevel || "";

  return (
    <div className={styles.page}>
      {/* Sticky top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span>←</span> Back
        </button>
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          {/* Logo placeholder — shows first letter of league name if no logo */}
          <div className={styles.logoWrap}>
            {league.logoUrl ? (
              <img
                src={league.logoUrl}
                alt={league.name}
                className={styles.logoImg}
              />
            ) : (
              <div className={styles.logoPlaceholder}>
                {league.name?.[0] || "L"}
              </div>
            )}
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.heroBadges}>
              {genderLabel && (
                <span className={`${styles.badge} ${styles.badgeGender}`}>
                  {genderLabel}
                </span>
              )}
              {levelLabel && (
                <span className={`${styles.badge} ${styles.badgeLevel}`}>
                  {levelLabel}
                </span>
              )}
              {/* Show inactive badge if the league is no longer active */}
              {!league.isActive && (
                <span className={`${styles.badge} ${styles.badgeInactive}`}>
                  Inactive
                </span>
              )}
            </div>

            {/* league.name is the full league name from LeagueResponseDto */}
            <h1 className={styles.leagueTitle}>{league.name}</h1>

            {/* league.shortName is the abbreviated name e.g. "USL" */}
            {league.shortName && (
              <p className={styles.shortName}>{league.shortName}</p>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left column: description + details */}
          <div className={styles.main}>
            {league.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About this League</h2>
                <p className={styles.description}>{league.description}</p>
              </section>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>League Info</h2>
              <div className={styles.infoGrid}>
                {genderLabel && (
                  <InfoRow icon="⚥" label="Gender" value={genderLabel} />
                )}
                {levelLabel && (
                  <InfoRow icon="📊" label="Level" value={levelLabel} />
                )}
                {/* league.foundedYear — Short type from the DTO */}
                {league.foundedYear && (
                  <InfoRow
                    icon="📅"
                    label="Founded"
                    value={league.foundedYear}
                  />
                )}
                {league.website && (
                  <InfoRow
                    icon="🌐"
                    label="Website"
                    value={
                      <a
                        href={league.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        {league.website}
                      </a>
                    }
                  />
                )}
              </div>
            </section>
          </div>

          {/* Right column: sidebar action card */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>Join this League</div>
              <p className={styles.sidebarText}>
                Interested in competing? Browse teams in this league or contact
                the league organizers directly.
              </p>
              <button
                className={styles.joinBtn}
                onClick={() =>
                  navigate("/find", { state: { section: "leagues" } })
                }
              >
                Browse Teams →
              </button>
              {league.website && (
                <a
                  href={league.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteBtn}
                >
                  Visit Website →
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
