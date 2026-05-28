import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveTournament } from "../../hooks/useTournament";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "../../lib/api";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function AdminTorneoPage() {
  const { data: tData, isLoading } = useActiveTournament();
  const tid = tData?.tournament?.id;
  const qc = useQueryClient();
  const { getToken } = useAuth();

  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    if (tData?.tournament) {
      setName(tData.tournament.name);
      setSeason(tData.tournament.season);
    }
  }, [tData]);

  const { data: groupsData } = useQuery({
    queryKey: ["groups", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/groups`);
      return res.json() as Promise<{ groups: any[] }>;
    },
    enabled: !!tid,
  });

  const updateTournament = useMutation({
    mutationFn: async () => {
      await authFetch(getToken(), `/api/tournaments/${tid}`, {
        method: "PUT",
        body: JSON.stringify({ name, season }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tournament"] }); alert("Guardado!"); },
  });

  const addGroup = useMutation({
    mutationFn: async () => {
      await authFetch(getToken(), "/api/groups", {
        method: "POST",
        body: JSON.stringify({ tournamentId: tid, name: newGroupName }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groups"] }); setNewGroupName(""); },
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: number) => {
      await authFetch(getToken(), `/api/groups/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });

  const createNewTournament = useMutation({
    mutationFn: async () => {
      // deactivate current
      if (tid) await authFetch(getToken(), `/api/tournaments/${tid}`, { method: "PUT", body: JSON.stringify({ active: false }) });
      await authFetch(getToken(), "/api/tournaments", {
        method: "POST",
        body: JSON.stringify({ name: "Nuevo Torneo", season: new Date().getFullYear().toString(), active: true }),
      });
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const groups = groupsData?.groups ?? [];

  return (
    <div style={{ padding: "16px 12px" }}>
      <BackHeader title="Configurar Torneo" />

      {isLoading && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Cargando...</div>}

      {tData?.tournament ? (
        <>
          {/* Tournament info */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "var(--gold)" }}>Datos del Torneo</div>
            <label style={labelStyle}>Nombre del torneo</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: DEMOLAY CUP" style={inputStyle} />
            <label style={labelStyle}>Temporada</label>
            <input value={season} onChange={e => setSeason(e.target.value)} placeholder="Ej: 2025" style={inputStyle} />
            <button onClick={() => updateTournament.mutate()} disabled={updateTournament.isPending} style={btnStyle}>
              {updateTournament.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

          {/* Groups */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "var(--gold)" }}>Grupos</div>
            {groups.map((g: any) => (
              <div key={g.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13,
              }}>
                <span style={{ fontWeight: 600 }}>{g.name}</span>
                <button onClick={() => { if (confirm(`¿Eliminar ${g.name}?`)) deleteGroup.mutate(g.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                placeholder="Ej: Grupo A" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => newGroupName && addGroup.mutate()} disabled={!newGroupName || addGroup.isPending}
                style={{ background: "var(--gold)", border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer", color: "#000", fontWeight: 700 }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* New tournament */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--text-muted)" }}>Nuevo torneo</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              Archiva el torneo actual y crea uno nuevo vacío. La plantilla se reutiliza para cualquier torneo futuro.
            </div>
            <button
              onClick={() => { if (confirm("¿Crear nuevo torneo? El actual quedará archivado.")) createNewTournament.mutate(); }}
              disabled={createNewTournament.isPending}
              style={{
                background: "var(--surface2)", border: "1px solid var(--border)",
                color: "var(--text)", borderRadius: 8, padding: "10px 16px",
                fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif",
              }}
            >
              + Crear nuevo torneo
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}>
          No hay torneo activo. Usá el botón de seed en el panel admin.
        </div>
      )}
    </div>
  );
}

function BackHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <button
        onClick={() => window.history.back()}
        style={{
          width: 34, height: 34, borderRadius: 8,
          background: "var(--surface2)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0,
        }}
      >
        <ArrowLeft size={16} color="var(--text-muted)" />
      </button>
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: "var(--gold)" }}>{title}</h1>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "var(--surface2)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--text)", fontSize: 13,
  fontFamily: "Poppins, sans-serif", outline: "none", marginBottom: 8,
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, color: "var(--text-muted)",
  fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5,
};

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center",
  background: "var(--gold)", color: "#000", border: "none",
  borderRadius: 8, padding: "10px 16px", fontWeight: 700,
  fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif",
};
