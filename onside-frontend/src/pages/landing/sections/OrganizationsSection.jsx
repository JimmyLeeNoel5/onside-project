import { useNavigate } from "react-router-dom";
import styles from "./OrganizationsSection.module.css";

const ADMIN_CARDS = [
  {
    icon: "🏆",
    tag: "Leagues",
    title: "Add a League",
    desc: "List your league on Onside. Manage seasons, divisions, and team registrations from one place.",
    cta: "Request a League →",
    href: "/leagues/request",
    accent: "#52b788",
    accentBg: "rgba(82,183,136,0.08)",
    accentBorder: "rgba(82,183,136,0.25)",
  },
  {
    icon: "🏛️",
    tag: "Clubs",
    title: "Start a Club",
    desc: "Create your club profile, build your teams, recruit players, and manage everything from one powerful dashboard.",
    cta: "Start a Club →",
    href: "/clubs/new",
    accent: "#93c5fd",
    accentBg: "rgba(147,197,253,0.08)",
    accentBorder: "rgba(147,197,253,0.25)",
  },
  {
    icon: "🔐",
    tag: "Access",
    title: "Request Admin Access",
    desc: "Apply for elevated privileges to manage a club, team, or league on Onside.",
    cta: "Request Access →",
    href: "/admin/request",
    accent: "#fcd34d",
    accentBg: "rgba(252,211,77,0.08)",
    accentBorder: "rgba(252,211,77,0.25)",
  },
];

export default function OrganizationsSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      {/* Glow orbs — same as FeatureSection dark */}
      <div className={`${styles.glowOrb} ${styles.glowOrbGreen}`} />
      <div className={`${styles.glowOrb} ${styles.glowOrbGreenBottom}`} />

      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>// For Organizations</div>
          <h2 className={styles.title}>Run the Game</h2>
          <p className={styles.subtitle}>
            Everything you need to build, manage, and grow your soccer
            organization — all in one place.
          </p>
        </div>

        <div className={styles.grid}>
          {ADMIN_CARDS.map((card) => (
            <div
              key={card.title}
              className={styles.card}
              onClick={() => navigate(card.href)}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <span
                  className={styles.cardTag}
                  style={{
                    color: card.accent,
                    background: card.accentBg,
                    border: `1px solid ${card.accentBorder}`,
                  }}
                >
                  {card.tag}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
              <div className={styles.cardCta} style={{ color: card.accent }}>
                {card.cta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
