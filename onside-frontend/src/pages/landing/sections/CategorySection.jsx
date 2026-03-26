import { useNavigate } from "react-router-dom";
import styles from "./CategorySection.module.css";

// Maps each category card to a section + optional subtab in BrowsePage's SIDEBAR.
// These values must match the id fields in BrowsePage's SIDEBAR array exactly.
const CATEGORIES = [
  {
    id: "rec",
    label: "Recreational",
    icon: "⚽",
    desc: "Casual leagues for all skill levels",
    section: "leagues",
    subtab: "leagues-mens",
  },
  {
    id: "youth",
    label: "Youth",
    icon: "🧒",
    desc: "U6–U18 programs, boys & girls",
    section: "youth",
    subtab: "youth-boys",
  },
  {
    id: "semi",
    label: "Semi-Pro",
    icon: "🏆",
    desc: "Competitive adult leagues",
    section: "leagues",
    subtab: "leagues-mens",
  },
  {
    id: "college",
    label: "Collegiate",
    icon: "🎓",
    desc: "NCAA & club soccer programs",
    section: "college",
    subtab: "college-mens",
  },
  {
    id: "pro",
    label: "Professional",
    icon: "⭐",
    desc: "MLS, USL & pro leagues",
    section: "leagues",
    subtab: "leagues-mens",
  },
  {
    id: "pickup",
    label: "Pickup",
    icon: "🤝",
    desc: "Drop-in games near you",
    section: "leagues",
    subtab: "leagues-mens",
    subchild: "pickup",
  },
];

export default function CategorySection({ onRegister }) {
  const navigate = useNavigate();

  // Navigate to /find with the section + subtab as location state.
  // BrowsePage reads location.state via useEffect to set the active section/subtab.
  function handleExplore(cat) {
    navigate("/find", {
      state: {
        section: cat.section,
        subtab: cat.subtab,
        subchild: cat.subchild,
      },
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.sectionLabel}>// Browse by category</div>
          <h2 className={styles.title}>FIND YOUR GAME</h2>
        </div>

        {/* Cards grid */}
        <div className={styles.grid}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={styles.card}
              onClick={() => handleExplore(cat)}
            >
              {/* Hover shimmer */}
              <div className={styles.cardShimmer} />

              <div className={styles.cardIcon}>{cat.icon}</div>
              <div className={styles.cardLabel}>{cat.label}</div>
              <div className={styles.cardDesc}>{cat.desc}</div>
              <div className={styles.cardExplore}>
                <span>Explore</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
