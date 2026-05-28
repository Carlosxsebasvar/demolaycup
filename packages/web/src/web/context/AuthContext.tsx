import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
  showLogin: false,
  setShowLogin: () => {},
});

const ADMIN_USER = "demolaycup";
const ADMIN_PASS = "2026";
const STORAGE_KEY = "demolay_admin_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");
  const [showLogin, setShowLogin] = useState(false);

  const login = (user: string, pass: string) => {
    if (user.trim() === ADMIN_USER && pass.trim() === ADMIN_PASS) {
      localStorage.setItem(STORAGE_KEY, "1");
      setIsAdmin(true);
      setShowLogin(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
