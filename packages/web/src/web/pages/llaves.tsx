import { useQuery } from "@tanstack/react-query";
import { useActiveTournament } from "../hooks/useTournament";

export default function LlavesPage() {
  const { data: tData } = useActiveTournament();
  const tid = tData?.tournament?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["matches-elim", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/matches`);
      return res.json() as Promise<{ matches: any[] }>;
    },
    enabled: !!tid,
  });

  const all = data?.matches ?? [];
  const cuartos = all.filter((m: any) => m.phase === "cuartos");
  const semis = all.filter((m: any) => m.phase === "semis");
  const final = all.filter((m: any) => m.phase === "final");

  const hasElim = cuartos.length > 0 || semis.length > 0 || final.length > 0;

  return (
    <div style={{ padding: "16px 12px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "var(--gold)" }}>Llaves</h1>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Fase eliminatoria</div>
      </div>

      {isLoading && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Cargando...</div>}

      {!isLoading && !hasElim && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 40, textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Fase de grupos en curso</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Las llaves eliminatorias se mostrarán aquí cuando finalice la fase de grupos.
          </div>
        </div>
      )}

      {hasElim && (
        <div>
          {cuartos.length > 0 && <BracketRound title="Cuartos de Final" matches={cuartos} />}
          {semis.length > 0 && <BracketRound title="Semifinales" matches={semis} />}
          {final.length > 0 && <BracketRound title="Gran Final" matches={final} isFinal />}
        </div>
      )}
    </div>
  );
}

function BracketRound({ title, matches, isFinal = false }: { title: string; matches: any[]; isFinal?: boolean }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontWeight: 800, fontSize: 13, color: isFinal ? "var(--gold)" : "var(--text)",
        letterSpacing: 1, textTransform: "uppercase",
        marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
      }}>
        {isFinal && "🏆 "}{title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {matches.map((m: any) => (
          <BracketMatch key={m.id} match={m} isFinal={isFinal} />
        ))}
      </div>
    </div>
  );
}

function BracketMatch({ match: m, isFinal }: { match: any; isFinal?: boolean }) {
  const isPlayed = m.status === "jugado";
  const homeWin = isPlayed && m.homeScore > m.awayScore;
  const awayWin = isPlayed && m.awayScore > m.homeScore;

  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${isFinal ? "var(--gold)" : "var(--border)"}`,
      borderRadius: 10, overflow: "hidden",
      boxShadow: isFinal ? "0 0 20px rgba(245,158,11,0.15)" : "none",
    }}>
      <TeamRow name={m.homeTeamName} score={m.homeScore} winner={homeWin} pending={!isPlayed} top />
      <div style={{ height: 1, background: "var(--border)" }} />
      <TeamRow name={m.awayTeamName} score={m.awayScore} winner={awayWin} pending={!isPlayed} />
      {m.matchTime && (
        <div style={{
          padding: "4px 12px", fontSize: 10, color: "var(--text-muted)",
          background: "var(--surface2)", borderTop: "1px solid var(--border)",
        }}>⏰ {m.matchTime} hs · {m.round}</div>
      )}
    </div>
  );
}

function TeamRow({ name, score, winner, pending, top }: {
  name: string; score: number | null; winner: boolean; pending: boolean; top?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 14px",
      background: winner ? "rgba(245,158,11,0.08)" : "transparent",
    }}>
      <span style={{
        fontWeight: winner ? 700 : 500, fontSize: 14,
        color: winner ? "var(--gold)" : "var(--text)",
      }}>
        {winner && "★ "}{name || "Por definir"}
      </span>
      <span style={{
        fontWeight: 800, fontSize: 18,
        color: winner ? "var(--gold)" : pending ? "var(--text-muted)" : "var(--text)",
        minWidth: 24, textAlign: "right",
      }}>
        {pending ? "-" : score ?? "-"}
      </span>
    </div>
  );
}
