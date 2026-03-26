import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../../context/AuthModalContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import styles from "./AuthModal.module.css";

export default function AuthModal() {
  const { isOpen, defaultView, returnTo, close } = useAuthModal();
  const navigate = useNavigate();

  const [view, setView] = useState(defaultView);
  const overlayRef = useRef(null);

  // Sync tab with defaultView whenever modal opens
  useEffect(() => {
    setView(defaultView);
  }, [defaultView, isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  // Close only when clicking the dark backdrop, not the modal card
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) close();
  };

  // Called by either form after a successful submit
  const handleSuccess = () => {
    close();
    navigate(returnTo || "/dashboard");
  };

  // Don't render at all when closed
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className={styles.modal}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={close} aria-label="Close">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className={styles.logoMark}>
          <span className={styles.logoIcon}>⚽</span>
          <span className={styles.logoText}>onside</span>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${view === "login" ? styles.tabActive : ""}`}
            onClick={() => setView("login")}
          >
            Log In
          </button>
          <button
            className={`${styles.tab} ${view === "register" ? styles.tabActive : ""}`}
            onClick={() => setView("register")}
          >
            Sign Up
          </button>
        </div>

        {/* Active form */}
        {view === "login" ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setView("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setView("login")}
          />
        )}
      </div>
    </div>
  );
}
