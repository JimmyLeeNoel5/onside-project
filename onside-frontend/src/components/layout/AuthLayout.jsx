import { Link } from "react-router-dom";
import styles from "./AuthLayout.module.css";

/**
 * Wrapper for all auth pages (Login, Register, ForgotPassword).
 *
 * Props:
 *  - children      (node)    — the form content (LoginForm, RegisterForm etc.)
 *  - footer        (node)    — optional link below the card
 *                              e.g. "Don't have an account? Sign up"
 *
 * Usage:
 *  <AuthLayout
 *    footer={<>Don't have an account? <Link to="/register">Sign up</Link></>}
 *  >
 *    <LoginForm />
 *  </AuthLayout>
 */

export default function AuthLayout({ children, footer }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            {/* Soccer ball SVG icon */}
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.93V15h2v1.93c-.33.04-.66.07-1 .07s-.67-.03-1-.07zm4 0v-1.27l1.76-1.02.98 1.7c-.83.4-1.74.63-2.74.59zM5.26 15.34l.98-1.7L8 14.66v1.27c-1-.04-1.91-.27-2.74-.59zM4 12c0-.67.1-1.32.26-1.94L6 11.13V13H4.26C4.1 12.68 4 12.35 4 12zm14.74 1H17v-1.87l1.74-1.07c.16.62.26 1.27.26 1.94 0 .35-.1.68-.26 1zm-1.98-4.54L15 9.58V8h1.5c.47.77.81 1.62.97 2.54L16.76 8.46zM13 8V6.07c.69.1 1.34.32 1.94.63L13 8zm-2 0L9.06 6.7c.6-.31 1.25-.53 1.94-.63V8zm-2 1.58l-1.76-1.12C7.81 7.62 8.5 7 9 6.54V8l-2 1.58z" />
            </svg>
          </div>
          <span className={styles.logoText}>
            On<span>side</span>
          </span>
        </Link>

        {/* Page content — LoginForm, RegisterForm etc. */}
        {children}
      </div>

      {/* Footer link below the card */}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
