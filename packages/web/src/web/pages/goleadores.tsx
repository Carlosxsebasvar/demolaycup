import { useQuery } from "@tanstack/react-query";
import { useActiveTournament } from "../hooks/useTournament";

export default function GoleadoresPage() {
  const { data: tData } = useActiveTournament();
  const tid = tData?.tournament?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["scorers", tid],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tid}/scorers`);
      return res.json() as Promise<{ scorers: any[] }>;
    },
    enabled: !!tid,
  });

  const scorers = data?.scorers ?? [];

  return (
    <div style={{ padding: "16px 12px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "var(--gold)" }}>Goleadores</h1>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Ranking de anotadores</div>
      </div>

      {isLoading && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Cargando...</div>}

      {!isLoading && scorers.length === 0 && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 40, textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Sin goles registrados</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Los goles se cargarán desde el panel de administración.
          </div>
        </div>
      )}

      {scorers.length > 0 && (
        <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "40px 1fr 80px 50px",
            padding: "8px 12px", fontSize: 10, color: "var(--text-muted)", fontWeight: 600,
            borderBottom: "1px solid var(--border)", textTransform: "uppercase",
          }}>
            <span>#</span><span>Jugador</span><span>Equipo</span>
            <span style={{ textAlign: "center", color: "var(--gold)" }}>Goles</span>
          </div>

          {scorers.map((s: any, i: number) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 80px 50px",
              padding: "12px 12px",
              borderBottom: i < scorers.length - 1 ? "1px solid var(--border)" : "none",
              background: i === 0 ? "rgba(245,158,11,0.08)" : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {i === 0 ? (
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: "var(--gold)", color: "#000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 13,
                  }}>1</div>
                ) : i === 1 ? (
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: "#9CA3AF", color: "#000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13,
                  }}>2</div>
                ) : i === 2 ? (
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: "#CD7F32", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13,
                  }}>3</div>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: 13 }}>{i + 1}</span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.playerName}</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{s.teamName}</div>
              <div style={{
                textAlign: "center", fontWeight: 900, fontSize: 20,
                color: i === 0 ? "var(--gold)" : "var(--text)",
              }}>
                {s.goals}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
