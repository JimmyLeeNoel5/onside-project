import styles from "./AuthHeader.module.css";
export default function AuthHeader({ title, subtitle }) {
  return (
    <div className={styles.header}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
