import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveTournament } from "../hooks/useTournament";

export default function PartidosPage() {
  const { data: tData } = useActiveTournament();
  const tid = tData?.tournament?.id;
  const [tab, setTab] = useState<"pendiente" | "jugado">("pendiente");

  const { data, isLoading } = useQuery({
    queryKey: ["matches", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/matches`);
      return res.json() as Promise<{ matches: any[] }>;
    },
    enabled: !!tid,
  });

  const { data: freeData } = useQuery({
    queryKey: ["free-teams", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/free-teams`);
      return res.json() as Promise<{ free: any[] }>;
    },
    enabled: !!tid,
  });

  const matches = (data?.matches ?? []).filter((m: any) => m.phase === "grupos");
  const filtered = matches.filter((m: any) => m.status === tab);

  // group by round
  const byRound: Record<string, any[]> = {};
  for (const m of filtered) {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  }

  const freeByRound: Record<string, any[]> = {};
  for (const f of (freeData?.free ?? [])) {
    if (!freeByRound[f.round]) freeByRound[f.round] = [];
    freeByRound[f.round].push(f);
  }

  return (
    <div style={{ padding: "16px 12px" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "var(--gold)" }}>Partidos</h1>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Fase de grupos</div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", background: "var(--surface)", borderRadius: 8,
        padding: 4, gap: 4, marginBottom: 16, border: "1px solid var(--border)",
      }}>
        {(["pendiente", "jugado"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px", borderRadius: 6, border: "none",
            background: tab === t ? "var(--gold)" : "transparent",
            color: tab === t ? "#000" : "var(--text-muted)",
            fontWeight: 700, fontSize: 12, cursor: "pointer",
            fontFamily: "Poppins, sans-serif", textTransform: "capitalize",
          }}>
            {t === "pendiente" ? "Próximos" : "Resultados"}
          </button>
        ))}
      </div>

      {isLoading && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Cargando...</div>}

      {Object.entries(byRound).map(([round, rMatches]) => (
        <div key={round} style={{ marginBottom: 20 }}>
          <div style={{
            fontWeight: 700, fontSize: 12, color: "var(--gold)",
            letterSpacing: 1, textTransform: "uppercase",
            marginBottom: 8, paddingBottom: 6,
            borderBottom: "1px solid var(--border)",
          }}>{round}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rMatches.map((m: any) => (
              <MatchRow key={m.id} match={m} />
            ))}
            {/* Free teams */}
            {freeByRound[round] && freeByRound[round].length > 0 && (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--text-muted)",
                borderRadius: 8, padding: "10px 12px",
              }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>📌 Equipos libres</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {freeByRound[round].map((f: any) => f.teamName).join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {!isLoading && Object.keys(byRound).length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40, fontSize: 14 }}>
          {tab === "pendiente" ? "No hay partidos pendientes." : "No hay resultados todavía."}
        </div>
      )}
    </div>
  );
}

function MatchRow({ match: m }: { match: any }) {
  const isPlayed = m.status === "jugado";
  const homeWin = isPlayed && m.homeScore > m.awayScore;
  const awayWin = isPlayed && m.awayScore > m.homeScore;
  const draw = isPlayed && m.homeScore === m.awayScore;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderLeft: `3px solid ${isPlayed ? "var(--success)" : "var(--gold)"}`,
      borderRadius: 8, padding: "10px 12px",
    }}>
      {m.matchTime && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>⏰ {m.matchTime} hs</div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ flex: 1, fontWeight: homeWin ? 700 : 500, fontSize: 13, opacity: awayWin && !draw ? 0.6 : 1 }}>
          {m.homeTeamName}
        </span>
        {isPlayed ? (
          <div style={{
            background: "var(--surface2)", borderRadius: 6,
            padding: "4px 14px", fontWeight: 800, fontSize: 16,
            display: "flex", gap: 8, alignItems: "center",
            border: "1px solid var(--border)",
          }}>
            <span style={{ color: homeWin ? "var(--gold)" : "var(--text)" }}>{m.homeScore}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>-</span>
            <span style={{ color: awayWin ? "var(--gold)" : "var(--text)" }}>{m.awayScore}</span>
          </div>
        ) : (
          <div style={{
            background: "var(--surface2)", borderRadius: 6,
            padding: "5px 12px", fontWeight: 700, fontSize: 13, color: "var(--gold)",
          }}>vs</div>
        )}
        <span style={{ flex: 1, fontWeight: awayWin ? 700 : 500, fontSize: 13, textAlign: "right", opacity: homeWin && !draw ? 0.6 : 1 }}>
          {m.awayTeamName}
        </span>
      </div>
    </div>
  );
}
