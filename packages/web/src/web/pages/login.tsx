import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(user.trim(), pass.trim());
    if (ok) {
      navigate("/admin");
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 340,
        animation: shaking ? "shake 0.4s ease" : "none",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 14px",
          }}>⚽</div>
          <div style={{ fontWeight: 900, fontSize: 20, color: "var(--gold)", letterSpacing: 2 }}>DEMOLAY CUP</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, marginTop: 2 }}>PANEL ADMINISTRADOR</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: "var(--surface)",
            border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
            borderRadius: 14,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}>
            {/* Usuario */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Usuario
              </label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={user}
                  onChange={e => { setUser(e.target.value); setError(false); }}
                  placeholder="nombre de usuario"
                  autoComplete="username"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    fontSize: 14,
                    fontFamily: "Poppins, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(false); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    fontSize: 14,
                    fontFamily: "Poppins, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "var(--danger)", textAlign: "center", fontWeight: 600 }}>
                Usuario o contraseña incorrectos
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--gold)",
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "Poppins, sans-serif",
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              INGRESAR
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
