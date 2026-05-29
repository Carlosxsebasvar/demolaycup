import { useQuery } from "@tanstack/react-query";
import { useActiveTournament } from "../hooks/useTournament";
import { Calendar, Shield, Clock } from "lucide-react";

export default function HomePage() {
  const { data: tData } = useActiveTournament();
  const tid = tData?.tournament?.id;

  const { data: matchData, isLoading } = useQuery({
    queryKey: ["matches", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/matches`);
      return res.json() as Promise<{ matches: any[] }>;
    },
    enabled: !!tid,
  });

  const { data: standData } = useQuery({
    queryKey: ["standings", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/standings`);
      return res.json() as Promise<{ byGroup: any[] }>;
    },
    enabled: !!tid,
  });

  const matches = matchData?.matches ?? [];
  const played = matches.filter(m => m.status === "jugado").slice(-5).reverse();
  const upcoming = matches.filter(m => m.status === "pendiente").slice(0, 5);
  const roundName = upcoming[0]?.round ?? played[0]?.round ?? "";

  return (
    <div style={{ padding: "16px 12px" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a00 0%, var(--surface2) 60%, #1a1000 100%)",
        border: "1px solid var(--gold)",
        borderRadius: 12,
        padding: "20px 16px",
        marginBottom: 20,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20, fontSize: 80,
          opacity: 0.05, userSelect: "none",
        }}>⚽</div>
        <img
          src="/logo-demolay-cup.png"
          alt="DEMOLAY CUP"
          style={{
            width: 130, height: 130,
            objectFit: "contain",
            display: "block",
            margin: "0 auto",
          }}
        />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: 1 }}>
          {tData?.tournament?.season ?? "2026"} · FÚTBOL
        </div>
      </div>

      {/* Próximos partidos */}
      {upcoming.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <SectionTitle icon={<Clock size={15} />} title={`Próximos — ${roundName}`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map((m: any) => (
              <MatchCard key={m.id} match={m} pending />
            ))}
          </div>
        </section>
      )}

      {/* Últimos resultados */}
      {played.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <SectionTitle icon={<Calendar size={15} />} title="Últimos Resultados" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {played.map((m: any) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* Mini standings */}
      {standData?.byGroup?.slice(0, 2).map((g: any) => (
        <section key={g.group.id} style={{ marginBottom: 16 }}>
          <SectionTitle icon={<Shield size={15} />} title={g.group.name} />
          <MiniTable teams={g.teams.slice(0, 3)} />
        </section>
      ))}

      {isLoading && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Cargando...</div>}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 10,
      color: "var(--gold)",
      fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase",
    }}>
      {icon} {title}
    </div>
  );
}

function MatchCard({ match: m, pending = false }: { match: any; pending?: boolean }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderLeft: `3px solid ${pending ? "var(--gold)" : "var(--success)"}`,
      borderRadius: 8,
      padding: "10px 12px",
    }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>{m.round}</span>
        {m.matchTime && <span>⏰ {m.matchTime} hs</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{m.homeTeamName}</span>
        {pending
          ? <span style={{ padding: "3px 12px", background: "var(--surface2)", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>vs</span>
          : <span style={{ padding: "4px 14px", background: "var(--surface2)", borderRadius: 6, fontSize: 14, fontWeight: 800 }}>
              {m.homeScore} - {m.awayScore}
            </span>
        }
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13, textAlign: "right" }}>{m.awayTeamName}</span>
      </div>
    </div>
  );
}

function MiniTable({ teams }: { teams: any[] }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "28px 1fr 28px 28px 28px 36px",
        padding: "6px 10px", fontSize: 10, color: "var(--text-muted)", fontWeight: 600,
        borderBottom: "1px solid var(--border)",
      }}>
        <span>#</span><span>Equipo</span><span style={{ textAlign: "center" }}>PJ</span>
        <span style={{ textAlign: "center" }}>DG</span><span style={{ textAlign: "center" }}>PTS</span>
        <span style={{ textAlign: "right" }}></span>
      </div>
      {teams.map((t: any) => (
        <div key={t.teamId} style={{
          display: "grid", gridTemplateColumns: "28px 1fr 28px 28px 28px 36px",
          padding: "8px 10px", fontSize: 12,
          borderBottom: "1px solid var(--border)",
          background: t.pos === 1 ? "rgba(245,158,11,0.05)" : "transparent",
        }}>
          <span style={{
            fontWeight: 700,
            color: t.pos <= 2 ? "var(--gold)" : "var(--text-muted)"
          }}>{t.pos}</span>
          <span style={{ fontWeight: 500 }}>{t.teamName}</span>
          <span style={{ textAlign: "center", color: "var(--text-muted)" }}>{t.pj}</span>
          <span style={{ textAlign: "center", color: t.dg > 0 ? "var(--success)" : t.dg < 0 ? "var(--danger)" : "var(--text-muted)" }}>
            {t.dg > 0 ? `+${t.dg}` : t.dg}
          </span>
          <span style={{ textAlign: "center", fontWeight: 700, color: "var(--gold)" }}>{t.pts}</span>
          <span></span>
        </div>
      ))}
    </div>
  );
}
