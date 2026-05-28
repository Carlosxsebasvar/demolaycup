import { Link } from "wouter";
import { Users, Calendar, Target, Settings, Database, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveTournament } from "../../hooks/useTournament";

export default function AdminPage() {
  const { data: tData } = useActiveTournament();
  const qc = useQueryClient();
  const tournament = tData?.tournament;

  const seed = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/seed", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries();
      alert("Datos cargados correctamente!");
    },
  });

  return (
    <div style={{ padding: "16px 12px", maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link to="/">
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "var(--surface2)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <ArrowLeft size={16} color="var(--text-muted)" />
          </div>
        </Link>
        <div>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: "var(--gold)" }}>Panel Admin</h1>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{tournament?.name ?? "DEMOLAY CUP"}</div>
        </div>
      </div>

      {/* Seed button */}
      {!tournament && (
        <div style={{
          background: "rgba(245,158,11,0.1)", border: "1px solid var(--gold)",
          borderRadius: 10, padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>⚡ Sin torneo activo</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
            Cargá los datos del DEMOLAY CUP 2025 con todas las fechas y equipos.
          </div>
          <button
            onClick={() => seed.mutate()}
            disabled={seed.isPending}
            style={{
              background: "var(--gold)", color: "#000", border: "none",
              borderRadius: 8, padding: "10px 20px", fontWeight: 700,
              fontSize: 14, cursor: "pointer", fontFamily: "Poppins, sans-serif",
            }}
          >
            {seed.isPending ? "Cargando..." : "Cargar datos iniciales"}
          </button>
        </div>
      )}

      {tournament && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "12px 14px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{tournament.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Temporada {tournament.season}</div>
          </div>
          <div style={{
            background: tournament.active ? "rgba(34,197,94,0.15)" : "var(--surface2)",
            color: tournament.active ? "var(--success)" : "var(--text-muted)",
            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          }}>
            {tournament.active ? "● Activo" : "Inactivo"}
          </div>
        </div>
      )}

      {/* Nav cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AdminCard to="/admin/equipos" icon={<Users size={22} color="var(--gold)" />} title="Equipos" desc="Gestionar equipos y jugadores" />
        <AdminCard to="/admin/partidos" icon={<Calendar size={22} color="var(--gold)" />} title="Partidos" desc="Cargar resultados y fixtures" />
        <AdminCard to="/admin/goles" icon={<Target size={22} color="var(--gold)" />} title="Goles" desc="Registrar goleadores por partido" />
        <AdminCard to="/admin/torneo" icon={<Settings size={22} color="var(--gold)" />} title="Torneo" desc="Configurar nombre, grupos, temporada" />
      </div>

      {tournament && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => { if (confirm("¿Resetear todos los datos?")) seed.mutate(); }}
            disabled={seed.isPending}
            style={{
              width: "100%", padding: "10px", borderRadius: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid var(--danger)",
              color: "var(--danger)", fontWeight: 600, fontSize: 13,
              cursor: "pointer", fontFamily: "Poppins, sans-serif",
            }}
          >
            <Database size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Resetear datos de ejemplo
          </button>
        </div>
      )}
    </div>
  );
}

function AdminCard({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", transition: "border-color 0.15s",
        textDecoration: "none",
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: "rgba(245,158,11,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
        </div>
        <div style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 18 }}>›</div>
      </div>
    </Link>
  );
}
