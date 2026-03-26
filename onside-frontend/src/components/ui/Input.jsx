import styles from "./Input.module.css";
import { forwardRef } from "react";
/**
 * Reusable labeled input field.
 *
 * Props:
 *  - label       (string)  — label text shown above the input
 *  - error       (string)  — error message shown below the input
 *  - required    (bool)    — shows a red asterisk next to the label
 *  - id          (string)  — links label to input for accessibility
 *  - ...rest               — all standard HTML input props (type, placeholder, etc.)
 *
 * Usage:
 *  <Input
 *    label="Email"
 *    id="email"
 *    type="email"
 *    placeholder="you@example.com"
 *    required
 *    error={errors.email?.message}
 *    {...register('email')}
 *  />
 */

const Input = forwardRef(
  ({ label, error, required = false, id, className = "", ...rest }, ref) => {
    return (
      <div className={styles.wrapper}>
        {/* Label */}
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        {/* Input field */}
        <input
          id={id}
          ref={ref}
          className={`
          ${styles.input}
          ${error ? styles.error : ""}
          ${className}
        `.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />

        {/* Error message */}
        {error && (
          <span id={`${id}-error`} className={styles.errorMessage}>
            ⚠ {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
