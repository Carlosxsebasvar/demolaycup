import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const tournaments = sqliteTable("tournaments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  season: text("season").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  name: text("name").notNull(), // "Grupo A", "Grupo B"
});

export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  groupId: integer("group_id").references(() => groups.id),
  name: text("name").notNull(),
  shield: text("shield"), // emoji or url
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  number: integer("number"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  homeTeamId: integer("home_team_id").notNull().references(() => teams.id),
  awayTeamId: integer("away_team_id").notNull().references(() => teams.id),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  matchDate: text("match_date"), // ISO string
  matchTime: text("match_time"), // "16:00"
  round: text("round").notNull(), // "Fecha 1", "Cuartos", "Semi", "Final"
  phase: text("phase").notNull().default("grupos"), // "grupos" | "cuartos" | "semis" | "final"
  status: text("status").notNull().default("pendiente"), // "pendiente" | "jugado" | "libre"
  notes: text("notes"),
});

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull().references(() => matches.id),
  playerId: integer("player_id").references(() => players.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  playerName: text("player_name"), // fallback if no player linked
  minute: integer("minute"),
  isOwnGoal: integer("is_own_goal", { mode: "boolean" }).default(false),
});

export const freeTeams = sqliteTable("free_teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  round: text("round").notNull(),
});
