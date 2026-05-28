import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, setShowLogin } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      setShowLogin(true);
    }
  }, [isAdmin]);

  if (!isAdmin) return null;
  return <>{children}</>;
}
