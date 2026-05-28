import { useQuery } from "@tanstack/react-query";
import { useActiveTournament } from "../hooks/useTournament";

export default function GruposPage() {
  const { data: tData } = useActiveTournament();
  const tid = tData?.tournament?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["standings", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/standings`);
      return res.json() as Promise<{ byGroup: any[] }>;
    },
    enabled: !!tid,
  });

  if (isLoading) return <LoadingScreen />;
  if (!data?.byGroup?.length) return <EmptyScreen msg="No hay grupos todavía." />;

  return (
    <div style={{ padding: "16px 12px" }}>
      <PageTitle title="Tabla de Posiciones" sub="Fase de grupos" />
      {data.byGroup.map((g: any) => (
        <GroupTable key={g.group.id} group={g} />
      ))}
    </div>
  );
}

function GroupTable({ group }: { group: any }) {
  const { group: g, teams } = group;
  // columns: # | Equipo | PJ | PG | PE | PP | GF | GC | DG | PTS
  const cols = "22px 1fr 26px 26px 26px 26px 30px 30px 36px 34px";
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        background: "var(--gold)", color: "#000",
        fontWeight: 800, fontSize: 13, letterSpacing: 1,
        padding: "7px 12px", borderRadius: "8px 8px 0 0",
        textTransform: "uppercase",
      }}>{g.name}</div>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: "none",
        borderRadius: "0 0 8px 8px",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: cols,
          padding: "6px 10px",
          fontSize: 10,
          color: "var(--text-muted)",
          fontWeight: 600,
          borderBottom: "1px solid var(--border)",
          textTransform: "uppercase",
        }}>
          <span>#</span>
          <span>Equipo</span>
          <span style={{ textAlign: "center" }}>PJ</span>
          <span style={{ textAlign: "center" }}>PG</span>
          <span style={{ textAlign: "center" }}>PE</span>
          <span style={{ textAlign: "center" }}>PP</span>
          <span style={{ textAlign: "center" }}>GF</span>
          <span style={{ textAlign: "center" }}>GC</span>
          <span style={{ textAlign: "center", color: "var(--gold)" }}>DG</span>
          <span style={{ textAlign: "right", color: "var(--gold)" }}>PTS</span>
        </div>

        {/* Rows */}
        {teams.map((t: any, i: number) => (
          <div key={t.teamId} style={{
            display: "grid",
            gridTemplateColumns: cols,
            padding: "9px 10px",
            borderBottom: i < teams.length - 1 ? "1px solid var(--border)" : "none",
            background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
            alignItems: "center",
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              background: t.pos <= 2 ? "var(--gold)" : "var(--surface2)",
              color: t.pos <= 2 ? "#000" : "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
            }}>{t.pos}</div>
            <span style={{ fontWeight: 600, fontSize: 12 }}>{t.teamName}</span>
            <span style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>{t.pj}</span>
            <span style={{ textAlign: "center", fontSize: 12, color: "var(--success)" }}>{t.pg}</span>
            <span style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>{t.pe}</span>
            <span style={{ textAlign: "center", fontSize: 12, color: "var(--danger)" }}>{t.pp}</span>
            <span style={{ textAlign: "center", fontSize: 12 }}>{t.gf}</span>
            <span style={{ textAlign: "center", fontSize: 12 }}>{t.gc}</span>
            <span style={{
              textAlign: "center", fontSize: 12, fontWeight: 600,
              color: t.dg > 0 ? "var(--success)" : t.dg < 0 ? "var(--danger)" : "var(--text-muted)",
            }}>{t.dg > 0 ? `+${t.dg}` : t.dg}</span>
            <span style={{
              textAlign: "right", fontWeight: 800, fontSize: 14,
              color: "var(--gold)",
            }}>{t.pts}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "6px 4px", fontSize: 10, color: "var(--text-muted)" }}>
        🟨 Top 2 avanzan a eliminatorias
      </div>
    </div>
  );
}

function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "var(--gold)" }}>{title}</h1>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function LoadingScreen() {
  return <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 60, fontSize: 14 }}>Cargando...</div>;
}
function EmptyScreen({ msg }: { msg: string }) {
  return <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 60, fontSize: 14 }}>{msg}</div>;
}
