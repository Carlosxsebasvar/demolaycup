import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveTournament } from "../../hooks/useTournament";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "../../lib/api";
import { ArrowLeft, Plus, Trash2, CheckCircle, Pencil, X } from "lucide-react";

const PHASES = ["grupos", "cuartos", "semis", "final"];

interface EditState {
  home: string;
  away: string;
  round: string;
  matchDate: string;
  matchTime: string;
}

export default function AdminPartidosPage() {
  const { data: tData } = useActiveTournament();
  const { getToken } = useAuth();
  const tid = tData?.tournament?.id;
  const qc = useQueryClient();

  const [form, setForm] = useState({
    homeTeamId: "", awayTeamId: "",
    homeScore: "", awayScore: "",
    matchDate: "", matchTime: "",
    round: "Fecha 1", phase: "grupos",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({ home: "", away: "", round: "", matchDate: "", matchTime: "" });
  const [filterPhase, setFilterPhase] = useState("grupos");

  const { data: matchData } = useQuery({
    queryKey: ["matches", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/matches`);
      return res.json() as Promise<{ matches: any[] }>;
    },
    enabled: !!tid,
  });

  const { data: teamsData } = useQuery({
    queryKey: ["teams", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/teams`);
      return res.json() as Promise<{ teams: any[] }>;
    },
    enabled: !!tid,
  });

  const addMatch = useMutation({
    mutationFn: async () => {
      await authFetch(getToken(), "/api/matches", {
        method: "POST",
        body: JSON.stringify({
          tournamentId: tid,
          homeTeamId: Number(form.homeTeamId),
          awayTeamId: Number(form.awayTeamId),
          homeScore: form.homeScore !== "" ? Number(form.homeScore) : null,
          awayScore: form.awayScore !== "" ? Number(form.awayScore) : null,
          matchDate: form.matchDate || null,
          matchTime: form.matchTime || null,
          round: form.round,
          phase: form.phase,
          status: form.homeScore !== "" ? "jugado" : "pendiente",
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      setForm({ ...form, homeTeamId: "", awayTeamId: "", homeScore: "", awayScore: "", matchDate: "", matchTime: "" });
    },
  });

  const saveMatch = useMutation({
    mutationFn: async (id: number) => {
      await authFetch(getToken(), `/api/matches/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          homeScore: editState.home !== "" ? Number(editState.home) : null,
          awayScore: editState.away !== "" ? Number(editState.away) : null,
          status: editState.home !== "" ? "jugado" : "pendiente",
          round: editState.round || undefined,
          matchDate: editState.matchDate || null,
          matchTime: editState.matchTime || null,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      setEditId(null);
    },
  });

  const deleteMatch = useMutation({
    mutationFn: async (id: number) => {
      await authFetch(getToken(), `/api/matches/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });

  const matches = (matchData?.matches ?? []).filter((m: any) => m.phase === filterPhase);
  const teams = teamsData?.teams ?? [];

  // Group matches by round
  const byRound: Record<string, any[]> = {};
  for (const m of matches) {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  }
  const rounds = Object.keys(byRound).sort();

  const openEdit = (m: any) => {
    setEditId(m.id);
    setEditState({
      home: m.homeScore?.toString() ?? "",
      away: m.awayScore?.toString() ?? "",
      round: m.round ?? "",
      matchDate: m.matchDate ?? "",
      matchTime: m.matchTime ?? "",
    });
  };

  return (
    <div style={{ padding: "16px 12px" }}>
      <BackHeader title="Partidos" />

      {/* Add match form */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "var(--gold)" }}>+ Agregar Partido</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <select value={form.homeTeamId} onChange={e => setForm({ ...form, homeTeamId: e.target.value })} style={inputStyle}>
            <option value="">Local</option>
            {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={form.awayTeamId} onChange={e => setForm({ ...form, awayTeamId: e.target.value })} style={inputStyle}>
            <option value="">Visitante</option>
            {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <input type="number" min={0} placeholder="Goles local" value={form.homeScore}
            onChange={e => setForm({ ...form, homeScore: e.target.value })} style={inputStyle} />
          <input type="number" min={0} placeholder="Goles visit." value={form.awayScore}
            onChange={e => setForm({ ...form, awayScore: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <input type="date" value={form.matchDate} onChange={e => setForm({ ...form, matchDate: e.target.value })} style={inputStyle} />
          <input type="time" value={form.matchTime} onChange={e => setForm({ ...form, matchTime: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <input placeholder="Ej: Fecha 3" value={form.round}
            onChange={e => setForm({ ...form, round: e.target.value })} style={inputStyle} />
          <select value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} style={inputStyle}>
            {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={() => form.homeTeamId && form.awayTeamId && addMatch.mutate()}
          disabled={!form.homeTeamId || !form.awayTeamId || addMatch.isPending}
          style={btnStyle}
        >
          <Plus size={14} style={{ marginRight: 6 }} />
          {addMatch.isPending ? "Guardando..." : "Agregar partido"}
        </button>
      </div>

      {/* Phase filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {PHASES.map(p => (
          <button key={p} onClick={() => setFilterPhase(p)} style={{
            padding: "5px 12px", borderRadius: 20, border: "1px solid",
            borderColor: filterPhase === p ? "var(--gold)" : "var(--border)",
            background: filterPhase === p ? "rgba(245,158,11,0.1)" : "var(--surface)",
            color: filterPhase === p ? "var(--gold)" : "var(--text-muted)",
            fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
            fontFamily: "Poppins, sans-serif",
          }}>{p}</button>
        ))}
      </div>

      {/* Matches grouped by round */}
      {rounds.map(round => (
        <div key={round} style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "var(--gold)",
            letterSpacing: 1, textTransform: "uppercase",
            padding: "6px 10px", marginBottom: 8,
            background: "rgba(245,158,11,0.08)",
            borderRadius: 6, borderLeft: "3px solid var(--gold)",
          }}>
            {round}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byRound[round].map((m: any) => (
              <div key={m.id} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, padding: 14,
              }}>
                {/* Top row: status + delete */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                    background: m.status === "jugado" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.1)",
                    color: m.status === "jugado" ? "var(--success)" : "var(--gold)",
                  }}>{m.status}</span>
                  <button onClick={() => { if (confirm("¿Eliminar partido?")) deleteMatch.mutate(m.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 2 }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Teams + score */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{m.homeTeamName}</span>
                  <div style={{
                    background: "var(--surface2)", padding: "4px 12px", borderRadius: 6,
                    fontWeight: 800, fontSize: 15, minWidth: 60, textAlign: "center",
                  }}>
                    {m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : "vs"}
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13, textAlign: "right" }}>{m.awayTeamName}</span>
                </div>

                {/* Horario info */}
                {(m.matchDate || m.matchTime) && editId !== m.id && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                    📅 {m.matchDate ?? ""} {m.matchTime ? `⏰ ${m.matchTime}hs` : ""}
                  </div>
                )}

                {/* Edit panel */}
                {editId === m.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 6, alignItems: "center" }}>
                      <input type="number" min={0} value={editState.home}
                        onChange={e => setEditState({ ...editState, home: e.target.value })}
                        placeholder="Local" style={{ ...inputStyle, textAlign: "center" }} />
                      <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>-</span>
                      <input type="number" min={0} value={editState.away}
                        onChange={e => setEditState({ ...editState, away: e.target.value })}
                        placeholder="Visit." style={{ ...inputStyle, textAlign: "center" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <input type="date" value={editState.matchDate}
                        onChange={e => setEditState({ ...editState, matchDate: e.target.value })}
                        style={inputStyle} />
                      <input type="time" value={editState.matchTime}
                        onChange={e => setEditState({ ...editState, matchTime: e.target.value })}
                        style={inputStyle} />
                    </div>
                    <input
                      value={editState.round}
                      onChange={e => setEditState({ ...editState, round: e.target.value })}
                      placeholder="Nombre de fecha (ej: Fecha 4)"
                      style={inputStyle}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => saveMatch.mutate(m.id)}
                        disabled={saveMatch.isPending}
                        style={{ ...btnStyle, flex: 1, justifyContent: "center" }}>
                        <CheckCircle size={14} style={{ marginRight: 6 }} />
                        {saveMatch.isPending ? "Guardando..." : "Guardar"}
                      </button>
                      <button onClick={() => setEditId(null)} style={{
                        background: "var(--surface2)", border: "1px solid var(--border)",
                        borderRadius: 8, padding: "10px 14px", cursor: "pointer", color: "var(--text-muted)",
                      }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => openEdit(m)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    color: "var(--text-muted)", borderRadius: 6, padding: "6px 12px",
                    fontSize: 11, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600,
                  }}>
                    <Pencil size={12} /> Editar resultado / horario / fecha
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {rounds.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 30, fontSize: 13 }}>
          No hay partidos en esta fase.
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
  fontFamily: "Poppins, sans-serif", outline: "none",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center",
  background: "var(--gold)", color: "#000", border: "none",
  borderRadius: 8, padding: "10px 16px", fontWeight: 700,
  fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif",
};
