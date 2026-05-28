import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, User, X } from "lucide-react";

export function LoginModal() {
  const { showLogin, setShowLogin, login } = useAuth();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  if (!showLogin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(user, pass);
    if (!ok) {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  };

  const close = () => {
    setShowLogin(false);
    setUser("");
    setPass("");
    setError(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
        }}
      />
      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", zIndex: 201,
        transform: `translate(-50%, -50%) ${shaking ? "translateX(0)" : ""}`,
        width: "calc(100% - 48px)",
        maxWidth: 340,
        animation: shaking ? "shake 0.4s ease" : "none",
      }}>
        {/* Header */}
        <div style={{
          background: "var(--gold)", color: "#000",
          borderRadius: "14px 14px 0 0",
          padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>⚙️ ACCESO ADMIN</div>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <X size={18} color="#000" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: "none",
          borderRadius: "0 0 14px 14px",
          padding: 20,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Usuario */}
          <div style={{ position: "relative" }}>
            <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              value={user}
              onChange={e => { setUser(e.target.value); setError(false); }}
              placeholder="Usuario"
              autoComplete="username"
              autoFocus
              style={inputStyle}
            />
          </div>

          {/* Contraseña */}
          <div style={{ position: "relative" }}>
            <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(false); }}
              placeholder="Contraseña"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "var(--danger)", textAlign: "center", fontWeight: 600 }}>
              Usuario o contraseña incorrectos
            </div>
          )}

          <button type="submit" style={{
            width: "100%", padding: "11px",
            background: "var(--gold)", color: "#000",
            border: "none", borderRadius: 8,
            fontWeight: 800, fontSize: 13,
            cursor: "pointer", fontFamily: "Poppins, sans-serif",
            letterSpacing: 1, marginTop: 2,
          }}>
            INGRESAR
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translate(-50%,-50%) translateX(0)}
          20%{transform:translate(-50%,-50%) translateX(-8px)}
          40%{transform:translate(-50%,-50%) translateX(8px)}
          60%{transform:translate(-50%,-50%) translateX(-5px)}
          80%{transform:translate(-50%,-50%) translateX(5px)}
        }
      `}</style>
    </>
  );
}

const inputStyle: React.CSSProperties = {
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
};
