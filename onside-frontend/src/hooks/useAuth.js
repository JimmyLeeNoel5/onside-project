import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
/**
 * Hook to access auth state and actions from any component.
 *
 * Usage:
 *  const { user, isAuthenticated, login, logout } = useAuth();
 */

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
