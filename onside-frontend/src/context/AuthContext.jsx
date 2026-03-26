import { createContext, useState, useEffect, useCallback } from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../api/authApi";
import { setAccessToken, clearAuth } from "../api/axiosClient";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── On app startup — restore session ───────────────────────────────────────

  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { refresh } = await import("../api/authApi");
        const response = await refresh({ refreshToken });

        const {
          accessToken,
          refreshToken: newRefreshToken,
          user,
        } = response.data;

        setAccessToken(accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        setUser(user);
      } catch {
        clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  // Accepts an object { email, password } — modal passes data this way

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    const { accessToken, refreshToken, user } = response.data;

    setAccessToken(accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(user);

    return user;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────

  const register = useCallback(
    async ({ firstName, lastName, email, password }) => {
      const response = await registerRequest({
        firstName,
        lastName,
        email,
        password,
      });
      const { accessToken, refreshToken, user } = response.data;

      setAccessToken(accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);

      return user;
    },
    [],
  );

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logoutRequest({ refreshToken });
      }
    } catch {
      // Clear client side even if server call fails
    } finally {
      clearAuth();
      setUser(null);
    }
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register, // ← new
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
