import { createContext, useContext, useState } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultView, setDefaultView] = useState("login");
  const [returnTo, setReturnTo] = useState(null);

  const openLogin = (options = {}) => {
    setDefaultView("login");
    setReturnTo(options.returnTo || null);
    setIsOpen(true);
  };

  const openRegister = (options = {}) => {
    setDefaultView("register");
    setReturnTo(options.returnTo || null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setReturnTo(null);
  };

  return (
    <AuthModalContext.Provider
      value={{ isOpen, defaultView, returnTo, openLogin, openRegister, close }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx)
    throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
