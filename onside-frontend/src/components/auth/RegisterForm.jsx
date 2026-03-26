import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAuth from "../../hooks/useAuth";
import styles from "./AuthModal.module.css";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      onSuccess();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>First Name</label>
          <input
            className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
            type="text"
            placeholder="James"
            {...register("firstName")}
          />
          {errors.firstName && (
            <span className={styles.fieldError}>
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Last Name</label>
          <input
            className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
            type="text"
            placeholder="Rodriguez"
            {...register("lastName")}
          />
          {errors.lastName && (
            <span className={styles.fieldError}>{errors.lastName.message}</span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <span className={styles.fieldError}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <input
          className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
          type="password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          {...register("password")}
        />
        {errors.password && (
          <span className={styles.fieldError}>{errors.password.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Confirm Password</label>
        <input
          className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
          type="password"
          placeholder="••••••••"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <span className={styles.fieldError}>
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isLoading}>
        {isLoading ? <span className={styles.spinner} /> : "Create Account"}
      </button>

      <p className={styles.switchText}>
        Already have an account?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToLogin}
        >
          Log in
        </button>
      </p>
    </form>
  );
}
