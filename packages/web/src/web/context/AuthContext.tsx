import { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  getToken: () => null,
  showLogin: false,
  setShowLogin: () => {},
});

const STORAGE_KEY = "demolay_admin_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [showLogin, setShowLogin] = useState(false);

  const login = async (user: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (!res.ok) return false;
      const { token: jwt } = await res.json();
      localStorage.setItem(STORAGE_KEY, jwt);
      setToken(jwt);
      setIsAdmin(true);
      setShowLogin(false);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setIsAdmin(false);
  };

  const getToken = () => token;

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, getToken, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
