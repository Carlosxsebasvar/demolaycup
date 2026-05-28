import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq, and, sql } from "drizzle-orm";
import { createToken, validateCredentials, requireAdmin } from "./auth";

const app = new Hono()
  .basePath("api")
  .use(cors({ origin: "*" }))

  // ── HEALTH ──────────────────────────────────────────
  .get("/health", (c) => c.json({ status: "ok" }, 200))

  // ── AUTH ─────────────────────────────────────────────
  .post("/admin/login", async (c) => {
    const { user, pass } = await c.req.json();
    if (!validateCredentials(user, pass)) {
      return c.json({ error: "Credenciales incorrectas" }, 401);
    }
    const token = await createToken();
    return c.json({ token }, 200);
  })

  // ── TOURNAMENTS (lectura pública) ───────────────────
  .get("/tournaments", async (c) => {
    const tournaments = await db.select().from(schema.tournaments);
    return c.json({ tournaments }, 200);
  })
  .get("/tournaments/active", async (c) => {
    const [tournament] = await db.select().from(schema.tournaments).where(eq(schema.tournaments.active, true)).limit(1);
    return c.json({ tournament: tournament ?? null }, 200);
  })
  .post("/tournaments", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [tournament] = await db.insert(schema.tournaments).values(body).returning();
    return c.json({ tournament }, 201);
  })
  .put("/tournaments/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const [tournament] = await db.update(schema.tournaments).set(body).where(eq(schema.tournaments.id, id)).returning();
    return c.json({ tournament }, 200);
  })

  // ── GROUPS ──────────────────────────────────────────
  .get("/tournaments/:tid/groups", async (c) => {
    const tid = Number(c.req.param("tid"));
    const groups = await db.select().from(schema.groups).where(eq(schema.groups.tournamentId, tid));
    return c.json({ groups }, 200);
  })
  .post("/groups", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [group] = await db.insert(schema.groups).values(body).returning();
    return c.json({ group }, 201);
  })
  .delete("/groups/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.groups).where(eq(schema.groups.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── TEAMS ────────────────────────────────────────────
  .get("/tournaments/:tid/teams", async (c) => {
    const tid = Number(c.req.param("tid"));
    const teams = await db.select().from(schema.teams).where(eq(schema.teams.tournamentId, tid));
    return c.json({ teams }, 200);
  })
  .post("/teams", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [team] = await db.insert(schema.teams).values(body).returning();
    return c.json({ team }, 201);
  })
  .put("/teams/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const [team] = await db.update(schema.teams).set(body).where(eq(schema.teams.id, id)).returning();
    return c.json({ team }, 200);
  })
  .delete("/teams/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.teams).where(eq(schema.teams.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── PLAYERS ──────────────────────────────────────────
  .get("/teams/:tid/players", async (c) => {
    const tid = Number(c.req.param("tid"));
    const players = await db.select().from(schema.players).where(eq(schema.players.teamId, tid));
    return c.json({ players }, 200);
  })
  .get("/tournaments/:tid/players", async (c) => {
    const tid = Number(c.req.param("tid"));
    const players = await db
      .select({
        id: schema.players.id,
        name: schema.players.name,
        number: schema.players.number,
        teamId: schema.players.teamId,
        teamName: schema.teams.name,
      })
      .from(schema.players)
      .innerJoin(schema.teams, eq(schema.players.teamId, schema.teams.id))
      .where(eq(schema.teams.tournamentId, tid));
    return c.json({ players }, 200);
  })
  .post("/players", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [player] = await db.insert(schema.players).values(body).returning();
    return c.json({ player }, 201);
  })
  .put("/players/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const [player] = await db.update(schema.players).set(body).where(eq(schema.players.id, id)).returning();
    return c.json({ player }, 200);
  })
  .delete("/players/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.players).where(eq(schema.players.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── MATCHES ──────────────────────────────────────────
  .get("/tournaments/:tid/matches", async (c) => {
    const tid = Number(c.req.param("tid"));
    const rows = await db.all(sql`
      SELECT
        m.id, m.tournament_id as tournamentId, m.round, m.phase, m.status,
        m.match_date as matchDate, m.match_time as matchTime,
        m.home_team_id as homeTeamId, m.away_team_id as awayTeamId,
        m.home_score as homeScore, m.away_score as awayScore,
        ht.name as homeTeamName, at.name as awayTeamName
      FROM matches m
      INNER JOIN teams ht ON ht.id = m.home_team_id
      INNER JOIN teams at ON at.id = m.away_team_id
      WHERE m.tournament_id = ${tid}
      ORDER BY m.match_date, m.match_time
    `);
    return c.json({ matches: rows }, 200);
  })
  .post("/matches", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [match] = await db.insert(schema.matches).values(body).returning();
    return c.json({ match }, 201);
  })
  .put("/matches/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const [match] = await db.update(schema.matches).set(body).where(eq(schema.matches.id, id)).returning();
    return c.json({ match }, 200);
  })
  .delete("/matches/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.matches).where(eq(schema.matches.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── GOALS ─────────────────────────────────────────────
  .get("/matches/:mid/goals", async (c) => {
    const mid = Number(c.req.param("mid"));
    const goals = await db.select().from(schema.goals).where(eq(schema.goals.matchId, mid));
    return c.json({ goals }, 200);
  })
  .post("/goals", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [goal] = await db.insert(schema.goals).values(body).returning();
    return c.json({ goal }, 201);
  })
  .delete("/goals/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.goals).where(eq(schema.goals.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── SCORERS ───────────────────────────────────────────
  .get("/tournaments/:tid/scorers", async (c) => {
    const tid = Number(c.req.param("tid"));
    const scorers = await db.all(sql`
      SELECT 
        COALESCE(p.name, g.player_name, 'Desconocido') as playerName,
        t.name as teamName,
        COUNT(g.id) as goals
      FROM goals g
      INNER JOIN matches m ON m.id = g.match_id
      INNER JOIN teams t ON t.id = g.team_id
      LEFT JOIN players p ON p.id = g.player_id
      WHERE m.tournament_id = ${tid} AND g.is_own_goal = 0
      GROUP BY COALESCE(p.name, g.player_name), t.name
      ORDER BY COUNT(g.id) DESC
      LIMIT 20
    `);
    return c.json({ scorers }, 200);
  })

  // ── STANDINGS ─────────────────────────────────────────
  .get("/tournaments/:tid/standings", async (c) => {
    const tid = Number(c.req.param("tid"));
    const groups = await db.select().from(schema.groups).where(eq(schema.groups.tournamentId, tid));
    const teams = await db.select().from(schema.teams).where(eq(schema.teams.tournamentId, tid));
    const matches = await db.select().from(schema.matches).where(
      and(eq(schema.matches.tournamentId, tid), eq(schema.matches.status, "jugado"), eq(schema.matches.phase, "grupos"))
    );

    const standingsMap: Record<number, {
      teamId: number; teamName: string; groupId: number | null;
      pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number;
    }> = {};

    for (const team of teams) {
      standingsMap[team.id] = {
        teamId: team.id, teamName: team.name, groupId: team.groupId ?? null,
        pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0,
      };
    }

    for (const m of matches) {
      if (m.homeScore == null || m.awayScore == null) continue;
      const home = standingsMap[m.homeTeamId];
      const away = standingsMap[m.awayTeamId];
      if (!home || !away) continue;
      home.pj++; away.pj++;
      home.gf += m.homeScore; home.gc += m.awayScore;
      away.gf += m.awayScore; away.gc += m.homeScore;
      if (m.homeScore > m.awayScore) {
        home.pg++; home.pts += 3; away.pp++;
      } else if (m.homeScore < m.awayScore) {
        away.pg++; away.pts += 3; home.pp++;
      } else {
        home.pe++; away.pe++; home.pts++; away.pts++;
      }
    }

    const byGroup = groups.map(g => ({
      group: g,
      teams: Object.values(standingsMap)
        .filter(t => t.groupId === g.id)
        .sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf)
        .map((t, i) => ({ ...t, pos: i + 1, dg: t.gf - t.gc }))
    }));

    return c.json({ byGroup }, 200);
  })

  // ── FREE TEAMS ────────────────────────────────────────
  .get("/tournaments/:tid/free-teams", async (c) => {
    const tid = Number(c.req.param("tid"));
    const free = await db
      .select({ id: schema.freeTeams.id, teamId: schema.freeTeams.teamId, teamName: schema.teams.name, round: schema.freeTeams.round })
      .from(schema.freeTeams)
      .innerJoin(schema.teams, eq(schema.freeTeams.teamId, schema.teams.id))
      .where(eq(schema.freeTeams.tournamentId, tid));
    return c.json({ free }, 200);
  })
  .post("/free-teams", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [ft] = await db.insert(schema.freeTeams).values(body).returning();
    return c.json({ ft }, 201);
  })
  .delete("/free-teams/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.freeTeams).where(eq(schema.freeTeams.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── SEED (protegido) ──────────────────────────────────
  .post("/seed", requireAdmin, async (c) => {
    await db.delete(schema.goals);
    await db.delete(schema.freeTeams);
    await db.delete(schema.matches);
    await db.delete(schema.players);
    await db.delete(schema.teams);
    await db.delete(schema.groups);
    await db.delete(schema.tournaments);

    const [t] = await db.insert(schema.tournaments).values({ name: "DEMOLAY CUP - APERTURA", season: "2026", active: true }).returning();

    const [gA] = await db.insert(schema.groups).values({ tournamentId: t.id, name: "Grupo A" }).returning();
    const [gB] = await db.insert(schema.groups).values({ tournamentId: t.id, name: "Grupo B" }).returning();
    const [gC] = await db.insert(schema.groups).values({ tournamentId: t.id, name: "Grupo C" }).returning();
    const [gD] = await db.insert(schema.groups).values({ tournamentId: t.id, name: "Grupo D" }).returning();

    const teamDefs = [
      { name: "Hermes", groupId: gA.id }, { name: "Aurora", groupId: gA.id }, { name: "Lautaro", groupId: gA.id },
      { name: "Jeroviapy", groupId: gB.id }, { name: "Philos", groupId: gB.id }, { name: "Guardianes", groupId: gB.id },
      { name: "Fénix", groupId: gC.id }, { name: "Acosta Ñu", groupId: gC.id }, { name: "Fe", groupId: gC.id },
      { name: "León", groupId: gD.id }, { name: "Eligio", groupId: gD.id }, { name: "23 de Octubre", groupId: gD.id }, { name: "Prometeo", groupId: gD.id },
    ];

    const tmap: Record<string, number> = {};
    for (const td of teamDefs) {
      const [team] = await db.insert(schema.teams).values({ tournamentId: t.id, name: td.name, groupId: td.groupId }).returning();
      tmap[td.name] = team.id;
    }

    for (const name of ["Aurora", "Jeroviapy", "Fe"]) {
      if (tmap[name]) await db.insert(schema.freeTeams).values({ tournamentId: t.id, teamId: tmap[name], round: "Fecha 3" });
    }

    const add = async (h: string, a: string, hs: number | null, as_: number | null, round: string, time: string) => {
      await db.insert(schema.matches).values({
        tournamentId: t.id, homeTeamId: tmap[h], awayTeamId: tmap[a],
        homeScore: hs, awayScore: as_,
        matchDate: round === "Fecha 3" ? "2026-02-15" : round === "Fecha 2" ? "2026-02-08" : "2026-02-01",
        matchTime: time, round, phase: "grupos",
        status: hs !== null ? "jugado" : "pendiente",
      });
    };

    await add("Eligio", "23 de Octubre", 12, 0, "Fecha 1", "16:00");
    await add("Aurora", "Lautaro", 10, 2, "Fecha 1", "17:00");
    await add("Jeroviapy", "Guardianes", 6, 1, "Fecha 1", "18:00");
    await add("Fénix", "Fe", 6, 3, "Fecha 1", "19:00");
    await add("León", "Prometeo", 10, 1, "Fecha 1", "20:00");
    await add("Jeroviapy", "Philos", 4, 4, "Fecha 2", "16:00");
    await add("Eligio", "León", 0, 8, "Fecha 2", "17:00");
    await add("Aurora", "Hermes", 1, 2, "Fecha 2", "18:00");
    await add("Acosta Ñu", "Fe", 3, 2, "Fecha 2", "19:00");
    await add("Prometeo", "23 de Octubre", 2, 6, "Fecha 2", "20:00");
    await add("Lautaro", "Hermes", null, null, "Fecha 3", "16:00");
    await add("Guardianes", "Philos", null, null, "Fecha 3", "17:00");
    await add("León", "23 de Octubre", null, null, "Fecha 3", "18:00");
    await add("Eligio", "Prometeo", null, null, "Fecha 3", "19:00");
    await add("Fénix", "Acosta Ñu", null, null, "Fecha 3", "20:00");

    return c.json({ ok: true, tournamentId: t.id }, 201);
  });

export type AppType = typeof app;
export default app;
