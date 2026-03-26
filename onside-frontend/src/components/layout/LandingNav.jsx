import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../../context/AuthModalContext";
import useAuth from "../../hooks/useAuth";
import styles from "./LandingNav.module.css";

const NAV_ITEMS = [
  {
    label: "Adults",
    genders: [
      {
        label: "Men",
        items: [
          { label: "Leagues", section: "leagues", subtab: "leagues-mens" },
          { label: "Teams", section: "leagues", subtab: "leagues-mens", contentTab: "Teams" },
          { label: "Pickup", section: "pickup", subtab: "pickup-mens" },
          { label: "Tournaments", section: "leagues", subtab: "leagues-mens", subchild: "tournaments" },
          { label: "Tryouts", section: "tryouts", subtab: "tryouts-adults" },
        ],
      },
      {
        label: "Women",
        items: [
          { label: "Leagues", section: "leagues", subtab: "leagues-womens" },
          { label: "Teams", section: "leagues", subtab: "leagues-womens", contentTab: "Teams" },
          { label: "Pickup", section: "pickup", subtab: "pickup-womens" },
          { label: "Tournaments", section: "leagues", subtab: "leagues-womens", subchild: "tournaments" },
          { label: "Tryouts", section: "tryouts", subtab: "tryouts-adults" },
        ],
      },
    ],
  },
  {
    label: "Youth",
    genders: [
      {
        label: "Boys",
        items: [
          { label: "Recreational", section: "youth", subtab: "youth-boys" },
          { label: "Academy", section: "youth", subtab: "youth-boys" },
          { label: "YMCA", section: "youth", subtab: "youth-boys" },
          { label: "High School", section: "highschool", subtab: "hs-boys" },
        ],
      },
      {
        label: "Girls",
        items: [
          { label: "Recreational", section: "youth", subtab: "youth-girls" },
          { label: "Academy", section: "youth", subtab: "youth-girls" },
          { label: "YMCA", section: "youth", subtab: "youth-girls" },
          { label: "High School", section: "highschool", subtab: "hs-girls" },
        ],
      },
    ],
  },
  {
    label: "College",
    items: [
      { label: "Men's Programs", section: "college", subtab: "college-mens" },
      {
        label: "Women's Programs",
        section: "college",
        subtab: "college-womens",
      },
    ],
  },
  {
    label: "Indoor",
    items: [
      { label: "Men's", section: "indoor", subtab: "indoor-mens" },
      { label: "Women's", section: "indoor", subtab: "indoor-womens" },
      { label: "Co-Ed", section: "indoor", subtab: "indoor-coed" },
    ],
  },
  {
    label: "Coaching",
    items: [
      { label: "Find a Coach", section: "camps", subtab: "camps-coach" },
      { label: "Clinics", section: "camps", subtab: "camps-clinics" },
      { label: "Camps", section: "camps", subtab: "camps-youth" },
      { label: "Private Training", section: "camps", subtab: "camps-private" },
    ],
  },
];

function NavDropdown({ item, scrolled, navigate }) {
  const [open, setOpen] = useState(false);
  const [activeGender, setActiveGender] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasGenders = !!item.genders;
  const currentItems = hasGenders
    ? item.genders[activeGender].items
    : item.items;

  function handleItemClick(navItem) {
    setOpen(false);
    navigate("/find", {
      state: { section: navItem.section, subtab: navItem.subtab, contentTab: navItem.contentTab, subchild: navItem.subchild },
    });
  }

  return (
    <div className={styles.dropdownWrap} ref={ref}>
      <button
        className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ""} ${open ? styles.navLinkActive : ""}`}
        onClick={() => {
          setOpen((v) => !v);
          setActiveGender(0);
        }}
      >
        {item.label}
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {hasGenders && (
            <div className={styles.genderTabs}>
              {item.genders.map((g, i) => (
                <button
                  key={g.label}
                  className={`${styles.genderTab} ${activeGender === i ? styles.genderTabActive : ""}`}
                  onClick={() => setActiveGender(i)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}
          <div className={styles.dropdownItems}>
            {currentItems.map((navItem) => (
              <button
                key={navItem.label}
                className={styles.dropdownItem}
                onClick={() => handleItemClick(navItem)}
              >
                {navItem.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingNav() {
  const { openLogin, openRegister } = useAuthModal();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚽</div>
          <span
            className={`${styles.logoText} ${scrolled ? styles.logoTextScrolled : ""}`}
          >
            Onside
          </span>
        </div>

        {/* Center nav */}
        <div className={styles.centerNav}>
          {NAV_ITEMS.map((item) => (
            <NavDropdown
              key={item.label}
              item={item}
              scrolled={scrolled}
              navigate={navigate}
            />
          ))}
        </div>

        {/* Auth buttons — changes based on login state */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            // Logged in — show first name, Sign Out, and Dashboard
            <>
              <span
                className={`${styles.loginBtn} ${scrolled ? styles.loginBtnScrolled : ""}`}
                style={{ cursor: "default", borderColor: "transparent" }}
              >
                {user?.firstName}
              </span>
              <button
                className={`${styles.loginBtn} ${scrolled ? styles.loginBtnScrolled : ""}`}
                onClick={logout}
              >
                Sign Out
              </button>
              <button
                className={styles.signupBtn}
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
            </>
          ) : (
            // Not logged in — show Sign In + Get Started
            <>
              <button
                className={`${styles.loginBtn} ${scrolled ? styles.loginBtnScrolled : ""}`}
                onClick={openLogin}
              >
                Sign In
              </button>
              <button className={styles.signupBtn} onClick={openRegister}>
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
