import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Trophy, List, Calendar, BarChart2, Target, Settings, X, User, Lock, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: Trophy, label: "Inicio" },
  { to: "/grupos", icon: BarChart2, label: "Grupos" },
  { to: "/partidos", icon: Calendar, label: "Partidos" },
  { to: "/llaves", icon: List, label: "Llaves" },
  { to: "/goleadores", icon: Target, label: "Goles" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAdmin, login, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(user, pass);
    if (ok) {
      setShowModal(false);
      setUser("");
      setPass("");
      setError(false);
      setShowAdminPanel(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleLogout = () => {
    logout();
    setShowAdminPanel(false);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "var(--surface)", borderBottom: "2px solid var(--gold)",
        padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>⚽</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 1, color: "var(--gold)" }}>DEMOLAY CUP</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2 }}>APERTURA 2026</div>
          </div>
        </div>

        <button
          onClick={() => isAdmin ? setShowAdminPanel(v => !v) : setShowModal(true)}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: isAdmin ? "rgba(245,158,11,0.15)" : "var(--surface2)",
            border: `1px solid ${isAdmin ? "var(--gold)" : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
          <Settings size={16} color={isAdmin ? "var(--gold)" : "var(--text-muted)"} />
        </button>
      </header>

      {/* ── ADMIN PANEL (drawer) ── */}
      {isAdmin && showAdminPanel && (
        <div style={{
          background: "var(--surface)", borderBottom: "2px solid var(--gold)",
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "var(--gold)", letterSpacing: 1 }}>⚙️ PANEL ADMIN</span>
            <button onClick={handleLogout} style={{
              background: "none", border: "1px solid var(--danger)",
              color: "var(--danger)", borderRadius: 6, padding: "3px 10px",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Poppins, sans-serif",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <LogOut size={12} /> Cerrar sesión
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AdminLink to="/admin/partidos" label="Cargar / editar resultados" desc="Ponele el marcador a cada partido" />
            <AdminLink to="/admin/goles" label="Registrar goleadores" desc="Quién anotó en cada partido" />
            <AdminLink to="/admin/equipos" label="Gestionar equipos" desc="Agregar o editar equipos" />
            <AdminLink to="/admin/torneo" label="Configurar torneo" desc="Nombre, temporada, grupos" />
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main style={{ paddingBottom: 80 }}>
        {children}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "var(--surface)", borderTop: "1px solid var(--border)",
        display: "flex", zIndex: 100,
      }}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location === to || (to !== "/" && location.startsWith(to));
          return (
            <Link key={to} to={to} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 0 8px",
                color: active ? "var(--gold)" : "var(--text-muted)",
                borderTop: active ? "2px solid var(--gold)" : "2px solid transparent",
              }}>
                <Icon size={20} />
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: active ? 600 : 400 }}>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── LOGIN MODAL ── */}
      {showModal && (
        <>
          <div onClick={() => { setShowModal(false); setError(false); setUser(""); setPass(""); }}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} />

          <div style={{
            position: "fixed", top: "50%", left: "50%", zIndex: 201,
            transform: "translate(-50%, -50%)",
            width: "calc(100% - 40px)", maxWidth: 320,
            animation: shake ? "modalShake 0.4s ease" : "none",
          }}>
            {/* Modal header */}
            <div style={{
              background: "var(--gold)", color: "#000",
              borderRadius: "12px 12px 0 0", padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>⚙️ ACCESO ADMIN</span>
              <button onClick={() => { setShowModal(false); setError(false); setUser(""); setPass(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X size={18} color="#000" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleLogin} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderTop: "none", borderRadius: "0 0 12px 12px",
              padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{ position: "relative" }}>
                <User size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  type="text" value={user} onChange={e => { setUser(e.target.value); setError(false); }}
                  placeholder="Usuario" autoFocus
                  style={{ ...iStyle, paddingLeft: 34 }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  type="password" value={pass} onChange={e => { setPass(e.target.value); setError(false); }}
                  placeholder="Contraseña"
                  style={{ ...iStyle, paddingLeft: 34 }}
                />
              </div>
              {error && <div style={{ color: "var(--danger)", fontSize: 12, textAlign: "center", fontWeight: 600 }}>Usuario o contraseña incorrectos</div>}
              <button type="submit" style={{
                padding: "11px", background: "var(--gold)", color: "#000",
                border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13,
                cursor: "pointer", fontFamily: "Poppins, sans-serif", letterSpacing: 1,
              }}>INGRESAR</button>
            </form>
          </div>
        </>
      )}

      <style>{`
        @keyframes modalShake {
          0%,100%{transform:translate(-50%,-50%)}
          25%{transform:translate(calc(-50% - 8px),-50%)}
          75%{transform:translate(calc(-50% + 8px),-50%)}
        }
      `}</style>
    </div>
  );
}

function AdminLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link to={to}>
      <div style={{
        background: "var(--surface2)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "12px 14px",
        display: "flex", alignItems: "center", gap: 12,
        cursor: "pointer", textDecoration: "none",
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{label}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
    </Link>
  );
}

const iStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "var(--surface2)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--text)", fontSize: 14,
  fontFamily: "Poppins, sans-serif", outline: "none", boxSizing: "border-box",
};
