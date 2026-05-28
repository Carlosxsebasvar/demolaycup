import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveTournament } from "../../hooks/useTournament";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function AdminGolesPage() {
  const { data: tData } = useActiveTournament();
  const tid = tData?.tournament?.id;
  const qc = useQueryClient();

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [form, setForm] = useState({ playerName: "", teamId: "", quantity: 1 });

  const { data: matchData } = useQuery({
    queryKey: ["matches", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/matches`);
      return res.json() as Promise<{ matches: any[] }>;
    },
    enabled: !!tid,
  });

  const { data: goalsData, refetch: refetchGoals } = useQuery({
    queryKey: ["goals", selectedMatch],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${selectedMatch}/goals`);
      return res.json() as Promise<{ goals: any[] }>;
    },
    enabled: !!selectedMatch,
  });

  const { data: teamsData } = useQuery({
    queryKey: ["teams", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/teams`);
      return res.json() as Promise<{ teams: any[] }>;
    },
    enabled: !!tid,
  });

  const { data: playersData } = useQuery({
    queryKey: ["all-players", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/players`);
      return res.json() as Promise<{ players: any[] }>;
    },
    enabled: !!tid,
  });

  const addGoal = useMutation({
    mutationFn: async () => {
      const qty = Math.max(1, Math.min(20, Number(form.quantity) || 1));
      for (let i = 0; i < qty; i++) {
        await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId: selectedMatch,
            teamId: Number(form.teamId),
            playerName: form.playerName,
          }),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals", selectedMatch] });
      qc.invalidateQueries({ queryKey: ["scorers"] });
      setForm({ playerName: "", teamId: "", quantity: 1 });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals", selectedMatch] });
      qc.invalidateQueries({ queryKey: ["scorers"] });
    },
  });

  const playedMatches = (matchData?.matches ?? []).filter((m: any) => m.status === "jugado");
  const goals = goalsData?.goals ?? [];
  const teams = teamsData?.teams ?? [];
  const allPlayers = playersData?.players ?? [];
  const currentMatch = playedMatches.find((m: any) => m.id === selectedMatch);
  const matchTeamIds = currentMatch ? [currentMatch.homeTeamId, currentMatch.awayTeamId] : [];
  const matchPlayers = allPlayers.filter((p: any) => matchTeamIds.includes(p.teamId));

  return (
    <div style={{ padding: "16px 12px" }}>
      <BackHeader title="Goles" />

      {/* Select match */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--gold)" }}>Seleccionar Partido</div>
        <select
          value={selectedMatch ?? ""}
          onChange={e => setSelectedMatch(e.target.value ? Number(e.target.value) : null)}
          style={inputStyle}
        >
          <option value="">-- Elegir partido jugado --</option>
          {playedMatches.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.homeTeamName} {m.homeScore}-{m.awayScore} {m.awayTeamName} ({m.round})
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <>
          {/* Current goals */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>
              Goles registrados ({goals.length})
            </div>
            {goals.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin goles registrados</div>
            )}
            {goals.map((g: any) => {
              const teamName = teams.find((t: any) => t.id === g.team_id || t.id === g.teamId)?.name ?? "";
              return (
                <div key={g.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13,
                }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{g.player_name ?? g.playerName ?? "?"}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 11 }}>{teamName}</span>
                  </div>
                  <button onClick={() => deleteGoal.mutate(g.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add goal */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--gold)" }}>Agregar Gol</div>
            <select value={form.teamId} onChange={e => setForm({ ...form, teamId: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }}>
              <option value="">Equipo que anotó</option>
              {matchTeamIds.map(id => {
                const t = teams.find((t: any) => t.id === id);
                return t ? <option key={id} value={id}>{t.name}</option> : null;
              })}
            </select>
            <input
              list="players-list"
              value={form.playerName}
              onChange={e => setForm({ ...form, playerName: e.target.value })}
              placeholder="Nombre del goleador"
              style={{ ...inputStyle, marginBottom: 8 }}
            />
            <datalist id="players-list">
              {matchPlayers.map((p: any) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Cantidad:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                style={{ ...inputStyle, width: 70 }}
              />
            </div>
            <button
              onClick={() => form.playerName && form.teamId && addGoal.mutate()}
              disabled={!form.playerName || !form.teamId || addGoal.isPending}
              style={btnStyle}
            >
              <Plus size={14} style={{ marginRight: 6 }} />
              {addGoal.isPending ? "Guardando..." : `Registrar ${form.quantity > 1 ? `${form.quantity} goles` : "gol"}`}
            </button>
          </div>
        </>
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
};

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center",
  background: "var(--gold)", color: "#000", border: "none",
  borderRadius: 8, padding: "10px 16px", fontWeight: 700,
  fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif",
};
