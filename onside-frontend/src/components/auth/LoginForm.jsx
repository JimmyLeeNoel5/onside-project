import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAuth from "../../hooks/useAuth";
import styles from "./AuthModal.module.css";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginForm({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      onSuccess();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid email or password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {serverError && <div className={styles.serverError}>{serverError}</div>}

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
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <span className={styles.fieldError}>{errors.password.message}</span>
        )}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isLoading}>
        {isLoading ? <span className={styles.spinner} /> : "Log In"}
      </button>

      <p className={styles.switchText}>
        Don't have an account?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToRegister}
        >
          Sign up
        </button>
      </p>
    </form>
  );
}
