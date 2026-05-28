import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveTournament } from "../../hooks/useTournament";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminEquiposPage() {
  const { data: tData } = useActiveTournament();
  const tid = tData?.tournament?.id;
  const qc = useQueryClient();

  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newGroupId, setNewGroupId] = useState<string>("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerTeam, setNewPlayerTeam] = useState<number | null>(null);

  const { data: teamsData } = useQuery({
    queryKey: ["teams", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/teams`);
      return res.json() as Promise<{ teams: any[] }>;
    },
    enabled: !!tid,
  });

  const { data: groupsData } = useQuery({
    queryKey: ["groups", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/groups`);
      return res.json() as Promise<{ groups: any[] }>;
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

  const addTeam = useMutation({
    mutationFn: async () => {
      await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: tid, name: newTeamName, groupId: newGroupId ? Number(newGroupId) : null }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams"] }); setNewTeamName(""); setNewGroupId(""); },
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/teams/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });

  const addPlayer = useMutation({
    mutationFn: async () => {
      await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: newPlayerTeam, name: newPlayerName }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-players"] }); setNewPlayerName(""); setNewPlayerTeam(null); },
  });

  const deletePlayer = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/players/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-players"] }),
  });

  const teams = teamsData?.teams ?? [];
  const groups = groupsData?.groups ?? [];
  const allPlayers = playersData?.players ?? [];

  return (
    <div style={{ padding: "16px 12px" }}>
      <BackHeader title="Equipos & Jugadores" />

      {/* Add team */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--gold)" }}>Agregar Equipo</div>
        <input
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          placeholder="Nombre del equipo"
          style={inputStyle}
        />
        <select value={newGroupId} onChange={e => setNewGroupId(e.target.value)} style={{ ...inputStyle, marginTop: 8 }}>
          <option value="">Sin grupo</option>
          {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <button
          onClick={() => newTeamName && addTeam.mutate()}
          disabled={!newTeamName || addTeam.isPending}
          style={btnStyle}
        >
          <Plus size={14} style={{ marginRight: 6 }} />
          {addTeam.isPending ? "Guardando..." : "Agregar"}
        </button>
      </div>

      {/* Teams list */}
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-muted)", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
        Equipos ({teams.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {teams.map((team: any) => {
          const teamPlayers = allPlayers.filter((p: any) => p.teamId === team.id);
          const groupName = groups.find((g: any) => g.id === team.groupId)?.name ?? "Sin grupo";
          const expanded = expandedTeam === team.id;
          return (
            <div key={team.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div
                style={{ display: "flex", alignItems: "center", padding: "12px 14px", cursor: "pointer", gap: 10 }}
                onClick={() => setExpandedTeam(expanded ? null : team.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{team.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{groupName} · {teamPlayers.length} jugadores</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); if (confirm(`¿Eliminar ${team.name}?`)) deleteTeam.mutate(team.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--danger)" }}
                >
                  <Trash2 size={15} />
                </button>
                {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {expanded && (
                <div style={{ borderTop: "1px solid var(--border)", padding: 14 }}>
                  {teamPlayers.length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Sin jugadores registrados</div>
                  )}
                  {teamPlayers.map((p: any) => (
                    <div key={p.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "6px 0", borderBottom: "1px solid var(--border)",
                      fontSize: 13,
                    }}>
                      <span>{p.name}</span>
                      <button
                        onClick={() => deletePlayer.mutate(p.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <input
                      value={newPlayerTeam === team.id ? newPlayerName : ""}
                      onChange={e => { setNewPlayerName(e.target.value); setNewPlayerTeam(team.id); }}
                      onFocus={() => setNewPlayerTeam(team.id)}
                      placeholder="Nombre del jugador"
                      style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    />
                    <button
                      onClick={() => newPlayerName && newPlayerTeam === team.id && addPlayer.mutate()}
                      disabled={!newPlayerName || newPlayerTeam !== team.id}
                      style={{
                        background: "var(--gold)", border: "none", borderRadius: 8,
                        padding: "0 14px", cursor: "pointer", color: "#000", fontWeight: 700,
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
  borderRadius: 8, color: "var(--text)", fontSize: 14,
  fontFamily: "Poppins, sans-serif", outline: "none",
  marginBottom: 8,
};

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center",
  background: "var(--gold)", color: "#000", border: "none",
  borderRadius: 8, padding: "10px 16px", fontWeight: 700,
  fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif",
  marginTop: 4,
};
