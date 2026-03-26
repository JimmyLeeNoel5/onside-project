import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useAuthModal } from "../../context/AuthModalContext";
import BrowseLeagues from "./tabs/BrowseLeagues";
import BrowseTeams from "./tabs/BrowseTeams";
import BrowseTournaments from "./tabs/BrowseTournaments";
import BrowseCollege from "./tabs/BrowseCollege";
import BrowseHighSchool from "./tabs/BrowseHighSchool";
import BrowseYouth from "./tabs/BrowseYouth";
import BrowseIndoor from "./tabs/BrowseIndoor";
import BrowsePickup from "./tabs/BrowsePickup";
import BrowseTryouts from "./tabs/BrowseTryouts";
import BrowseCamps from "./tabs/BrowseCamps";
import styles from "./BrowsePage.module.css";

const MENS_CHILDREN = [
  { id: "leagues", label: "Leagues" },
  { id: "teams", label: "Teams" },
  { id: "pickup", label: "Pickup" },
  { id: "tournaments", label: "Tournaments" },
  { id: "tryouts", label: "Tryouts", sectionId: "tryouts", subtabId: "tryouts-adults" },
];

const WOMENS_CHILDREN = [
  { id: "leagues", label: "Leagues" },
  { id: "teams", label: "Teams" },
  { id: "pickup", label: "Pickup" },
  { id: "tournaments", label: "Tournaments" },
  { id: "tryouts", label: "Tryouts", sectionId: "tryouts", subtabId: "tryouts-adults" },
];

const SIDEBAR = [
  {
    id: "leagues",
    label: "Adults",
    icon: "🏆",
    subtabs: [
      { id: "leagues-mens", label: "Men's", children: MENS_CHILDREN },
      { id: "leagues-womens", label: "Women's", children: WOMENS_CHILDREN },
    ],
  },
  {
    id: "college",
    label: "College",
    icon: "🎓",
    subtabs: [
      {
        id: "college-mens",
        label: "Men's",
        children: [
          { id: "all", label: "All Divisions" },
          { id: "d1", label: "D1" },
          { id: "d2", label: "D2" },
          { id: "d3", label: "D3" },
          { id: "naia", label: "NAIA" },
          { id: "club", label: "Club" },
        ],
      },
      {
        id: "college-womens",
        label: "Women's",
        children: [
          { id: "all", label: "All Divisions" },
          { id: "d1", label: "D1" },
          { id: "d2", label: "D2" },
          { id: "d3", label: "D3" },
          { id: "naia", label: "NAIA" },
          { id: "club", label: "Club" },
        ],
      },
    ],
  },
  {
    id: "highschool",
    label: "High School",
    icon: "🏫",
    subtabs: [
      { id: "hs-boys", label: "Boys" },
      { id: "hs-girls", label: "Girls" },
    ],
  },
  {
    id: "youth",
    label: "Youth",
    icon: "⭐",
    subtabs: [
      {
        id: "youth-boys",
        label: "Boys",
        children: [
          { id: "all", label: "All" },
          { id: "recreational", label: "Recreational" },
          { id: "academy", label: "Academy" },
          { id: "ymca", label: "YMCA" },
        ],
      },
      {
        id: "youth-girls",
        label: "Girls",
        children: [
          { id: "all", label: "All" },
          { id: "recreational", label: "Recreational" },
          { id: "academy", label: "Academy" },
          { id: "ymca", label: "YMCA" },
        ],
      },
    ],
  },
  {
    id: "indoor",
    label: "Indoor",
    icon: "🏟️",
    subtabs: [
      { id: "indoor-mens", label: "Men's" },
      { id: "indoor-womens", label: "Women's" },
      { id: "indoor-coed", label: "Co-Ed" },
    ],
  },
  {
    id: "tryouts",
    label: "Tryouts",
    icon: "📋",
    subtabs: [
      { id: "tryouts-adults", label: "Adults" },
      { id: "tryouts-youth", label: "Youth" },
    ],
  },
  {
    id: "camps",
    label: "Coaching",
    icon: "🎯",
    subtabs: [
      { id: "camps-coach", label: "Find a Coach" },
      { id: "camps-clinics", label: "Clinics" },
      { id: "camps-youth", label: "Camps" },
      { id: "camps-private", label: "Private Training" },
    ],
  },
];

function ComingSoon({ label }) {
  return (
    <div className={styles.comingSoon}>
      <div className={styles.comingSoonIcon}>🚧</div>
      <div className={styles.comingSoonTitle}>{label}</div>
      <div className={styles.comingSoonText}>This section is coming soon</div>
    </div>
  );
}

const LEAGUES_SUBTAB_TO_PICKUP = {
  "leagues-mens": "pickup-mens",
  "leagues-womens": "pickup-womens",
};

function PageContent({ sectionId, subtabId, subchild, initialContentTab }) {
  if (sectionId === "leagues" && subchild === "pickup") {
    return <BrowsePickup subtab={LEAGUES_SUBTAB_TO_PICKUP[subtabId] || "pickup-mens"} />;
  }
  if (sectionId === "leagues") return <BrowseLeagues subtab={subtabId} subchild={subchild} initialTab={initialContentTab} />;
  if (sectionId === "teams") return <BrowseTeams />;
  if (sectionId === "college") return <BrowseCollege subtab={subtabId} division={subchild} />;
  if (sectionId === "highschool") return <BrowseHighSchool subtab={subtabId} />;
  if (sectionId === "youth") return <BrowseYouth subtab={subtabId} subchild={subchild} />;
  if (sectionId === "indoor") return <BrowseIndoor subtab={subtabId} />;
  if (sectionId === "tryouts") return <BrowseTryouts subtab={subtabId} />;
  if (sectionId === "camps") return <BrowseCamps subtab={subtabId} />;
  return null;
}

export default function BrowsePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { openLogin, openRegister } = useAuthModal();

  const [activeSection, setActiveSection] = useState("leagues");
  const [activeSubtab, setActiveSubtab] = useState("leagues-mens");
  const [activeSubchild, setActiveSubchild] = useState("all");
  const [expandedSections, setExpandedSections] = useState(["leagues"]);
  const [expandedSubtabs, setExpandedSubtabs] = useState(["leagues-mens"]);
  const [deepLinkContentTab, setDeepLinkContentTab] = useState(null);

  // Deep-link from landing page
  useEffect(() => {
    const { section, subtab, contentTab, subchild } = location.state || {};
    setDeepLinkContentTab(contentTab || null);
    if (!section) return;

    const s = SIDEBAR.find((s) => s.id === section);
    if (!s) return;

    setActiveSection(s.id);
    setExpandedSections([s.id]);

    if (subtab) {
      setActiveSubtab(subtab);
      const t = s.subtabs?.find((t) => t.id === subtab);
      if (t?.children) {
        setExpandedSubtabs([subtab]);
        setActiveSubchild(subchild || "all");
      } else {
        setExpandedSubtabs([]);
        setActiveSubchild(null);
      }
    } else if (s.subtabs?.length) {
      const firstTab = s.subtabs[0];
      setActiveSubtab(firstTab.id);
      if (firstTab.children) {
        setExpandedSubtabs([firstTab.id]);
        setActiveSubchild("all");
      } else {
        setExpandedSubtabs([]);
        setActiveSubchild(null);
      }
    } else {
      setActiveSubtab(null);
      setActiveSubchild(null);
      setExpandedSubtabs([]);
    }
  }, [location.state]);

  const section = SIDEBAR.find((s) => s.id === activeSection);
  const subtab = section?.subtabs?.find((t) => t.id === activeSubtab);

  function selectSection(s) {
    setActiveSection(s.id);
    if (s.subtabs?.length) {
      const firstTab = s.subtabs[0];
      setActiveSubtab(firstTab.id);
      setExpandedSections((prev) =>
        prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
      );
      if (firstTab.children) {
        setExpandedSubtabs([firstTab.id]);
        setActiveSubchild("all");
      } else {
        setExpandedSubtabs([]);
        setActiveSubchild(null);
      }
    } else {
      setActiveSubtab(null);
      setActiveSubchild(null);
      setExpandedSections([]);
      setExpandedSubtabs([]);
    }
  }

  function selectSubtab(sectionId, t) {
    setActiveSection(sectionId);
    setActiveSubtab(t.id);
    if (t.children) {
      setExpandedSubtabs((prev) =>
        prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id]
      );
      setActiveSubchild("all");
    } else {
      setExpandedSubtabs([]);
      setActiveSubchild(null);
    }
  }

  function selectSubchild(child) {
    if (child.sectionId) {
      const s = SIDEBAR.find((s) => s.id === child.sectionId);
      setActiveSection(child.sectionId);
      setExpandedSections([child.sectionId]);
      setActiveSubtab(child.subtabId);
      setActiveSubchild(null);
      const t = s?.subtabs?.find((t) => t.id === child.subtabId);
      setExpandedSubtabs(t?.children ? [child.subtabId] : []);
    } else {
      setActiveSubchild(child.id);
    }
  }

  // Derive header labels
  const activeChildLabel =
    subtab?.children?.find((c) => c.id === activeSubchild)?.label || null;
  const contentLabel = activeChildLabel || subtab?.label || section?.label || "";
  const contentGroup = section?.label || "";

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className={styles.logo} onClick={() => navigate("/")}>
          <div className={styles.logoIcon}>⚽</div>
          <span className={styles.logoText}>Onside</span>
        </button>
        <div className={styles.topBarAuth}>
          {isAuthenticated ? (
            <>
              <div className={styles.userChip}>
                <div className={styles.userAvatar}>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <span className={styles.userName}>{user?.firstName}</span>
              </div>
              <button className={styles.logoutBtn} onClick={logout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className={styles.signInBtn} onClick={openLogin}>
                Sign In
              </button>
              <button className={styles.getStartedBtn} onClick={openRegister}>
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHeading}>Find Your Game</div>

            {SIDEBAR.map((s) => {
              const isActive = activeSection === s.id;
              const isExpanded = expandedSections.includes(s.id);

              return (
                <div key={s.id} className={styles.sidebarGroup}>
                  <button
                    className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`}
                    onClick={() => selectSection(s)}
                  >
                    <span className={styles.sidebarIcon}>{s.icon}</span>
                    <span className={styles.sidebarLabel}>{s.label}</span>
                    {s.subtabs && (
                      <span
                        className={`${styles.sidebarChevron} ${isExpanded ? styles.sidebarChevronOpen : ""}`}
                      >
                        ›
                      </span>
                    )}
                    {isActive && !s.subtabs && <span className={styles.sidebarActiveBar} />}
                  </button>

                  {s.subtabs && isExpanded && (
                    <div className={styles.subtabs}>
                      {s.subtabs.map((t) => {
                        const isSubActive = activeSubtab === t.id;
                        const isSubExpanded = expandedSubtabs.includes(t.id);

                        return (
                          <div key={t.id}>
                            <button
                              className={`${styles.subtabItem} ${isSubActive ? styles.subtabItemActive : ""}`}
                              onClick={() => selectSubtab(s.id, t)}
                            >
                              {t.label}
                              {t.children && (
                                <span
                                  className={`${styles.sidebarChevron} ${isSubExpanded ? styles.sidebarChevronOpen : ""}`}
                                  style={{ marginLeft: "auto", fontSize: "0.75rem" }}
                                >
                                  ›
                                </span>
                              )}
                              {isSubActive && !t.children && (
                                <span className={styles.sidebarActiveBar} />
                              )}
                            </button>

                            {t.children && isSubExpanded && (
                              <div className={styles.subchildren}>
                                {t.children.map((c) => (
                                  <button
                                    key={c.id}
                                    className={`${styles.subchildItem} ${activeSubtab === t.id && activeSubchild === c.id ? styles.subchildItemActive : ""}`}
                                    onClick={() => selectSubchild(c)}
                                  >
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className={styles.main}>
          <div className={styles.contentHeader}>
            <div className={styles.contentHeaderGrid} />
            <div className={styles.contentHeaderInner}>
              <div className={styles.contentLabel}>// {contentGroup}</div>
              <div className={styles.contentTitleRow}>
                <h1 className={styles.contentTitle}>{contentLabel}</h1>
              </div>
            </div>
          </div>

          <div className={styles.contentBody}>
            <PageContent
              sectionId={activeSection}
              subtabId={activeSubtab}
              subchild={activeSubchild}
              initialContentTab={deepLinkContentTab}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
