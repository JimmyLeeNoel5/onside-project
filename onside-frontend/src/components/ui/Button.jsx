import styles from "./Button.module.css";
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  className = "",
  ...rest
}) {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${size !== "md" ? styles[size] : ""}
        ${loading ? styles.loading : ""}
        ${className}
      `.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {/* Show spinner alongside label when loading */}
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
