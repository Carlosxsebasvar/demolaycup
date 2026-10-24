import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer } from "lucide-react";
import { useActiveTournament } from "../../hooks/useTournament";

export default function AdminPlanillasPage() {
  const { data: tData } = useActiveTournament();
  const tournament = tData?.tournament;
  const tid = tournament?.id;

  const [leftTeamId, setLeftTeamId] = useState<string>("");
  const [rightTeamId, setRightTeamId] = useState<string>("");

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

  const teams = (teamsData?.teams ?? []).slice().sort((a: any, b: any) => a.name.localeCompare(b.name));
  const allPlayers = playersData?.players ?? [];

  const leftTeam = teams.find((t: any) => String(t.id) === leftTeamId);
  const rightTeam = teams.find((t: any) => String(t.id) === rightTeamId);
  const leftPlayers = allPlayers.filter((p: any) => String(p.teamId) === leftTeamId);
  const rightPlayers = allPlayers.filter((p: any) => String(p.teamId) === rightTeamId);

  const ready = !!leftTeam && !!rightTeam && leftTeamId !== rightTeamId;

  const today = new Date().toLocaleDateString("es-PY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ padding: "16px 12px" }}>
      {/* --- UI de selección (no sale en la impresión) --- */}
      <div className="no-print">
        <BackHeader title="Imprimir Planilla" />

        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: 14, marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--gold)" }}>
            Elegí los dos equipos del partido
          </div>

          <label style={labelStyle}>Equipo (izquierda)</label>
          <select value={leftTeamId} onChange={e => setLeftTeamId(e.target.value)} style={inputStyle}>
            <option value="">Seleccionar equipo...</option>
            {teams.map((t: any) => (
              <option key={t.id} value={t.id} disabled={String(t.id) === rightTeamId}>{t.name}</option>
            ))}
          </select>

          <label style={labelStyle}>Equipo (derecha)</label>
          <select value={rightTeamId} onChange={e => setRightTeamId(e.target.value)} style={{ ...inputStyle, marginBottom: 4 }}>
            <option value="">Seleccionar equipo...</option>
            {teams.map((t: any) => (
              <option key={t.id} value={t.id} disabled={String(t.id) === leftTeamId}>{t.name}</option>
            ))}
          </select>

          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
            Fecha de impresión: <b style={{ color: "var(--text)" }}>{today}</b>
          </div>
        </div>

        {ready && (
          <button onClick={() => window.print()} style={btnStyle}>
            <Printer size={16} style={{ marginRight: 8 }} />
            Imprimir planilla
          </button>
        )}

        {!ready && (
          <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
            Elegí dos equipos distintos para generar la planilla.
          </div>
        )}

        {ready && (
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
            Vista previa abajo. Al imprimir se usa hoja A4 horizontal.
          </div>
        )}
      </div>

      {/* --- Hoja imprimible (solo visible al imprimir) --- */}
      {ready && (
        <div className="print-sheet">
          <div className="sheet-header">
            <div className="sheet-title">DEMOLAY CUP — PLANILLA DE BUENA FE</div>
            <div className="sheet-subtitle">
              {tournament?.name ?? "DEMOLAY CUP"} · Región Oeste, Paraguay
            </div>
            <div className="sheet-date">Fecha: {today}</div>
          </div>

          <div className="sheet-teams">
            <TeamColumn name={leftTeam?.name} players={leftPlayers} />
            <div className="sheet-divider" />
            <TeamColumn name={rightTeam?.name} players={rightPlayers} />
          </div>

          <div className="sheet-footer">
            <div className="sheet-footer-row">
              <div className="sheet-footer-cell">
                <div className="sheet-footer-label">Firma Delegado/Capitán — {leftTeam?.name}</div>
                <div className="sheet-sign-line" />
              </div>
              <div className="sheet-footer-cell">
                <div className="sheet-footer-label">Firma Delegado/Capitán — {rightTeam?.name}</div>
                <div className="sheet-sign-line" />
              </div>
            </div>
            <div className="sheet-footer-row">
              <div className="sheet-footer-cell">
                <div className="sheet-footer-label">Nombre del Árbitro</div>
                <div className="sheet-sign-line" />
              </div>
              <div className="sheet-footer-cell">
                <div className="sheet-footer-label">Firma del Árbitro</div>
                <div className="sheet-sign-line" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamColumn({ name, players }: { name?: string; players: any[] }) {
  const sorted = players.slice().sort((a, b) => (a.number ?? 999) - (b.number ?? 999));
  return (
    <div className="sheet-team">
      <div className="sheet-team-name">{name}</div>
      <table className="sheet-table">
        <thead>
          <tr>
            <th className="col-idx">N°</th>
            <th>Nombre y Apellido</th>
            <th className="col-shirt">Camiseta</th>
            <th className="col-mark">Goles</th>
            <th className="col-mark">T.A.</th>
            <th className="col-mark">T.R.</th>
            <th className="col-sign">Firma</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={p.id}>
              <td className="col-idx">{i + 1}</td>
              <td>{p.name}</td>
              <td className="col-shirt"></td>
              <td className="col-mark"></td>
              <td className="col-mark"></td>
              <td className="col-mark"></td>
              <td className="col-sign"></td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: "center", color: "#999" }}>Sin jugadores cargados</td></tr>
          )}
        </tbody>
      </table>
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

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4,
};

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: "100%",
  background: "var(--gold)", color: "#000", border: "none",
  borderRadius: 8, padding: "12px 16px", fontWeight: 700,
  fontSize: 14, cursor: "pointer", fontFamily: "Poppins, sans-serif",
};
