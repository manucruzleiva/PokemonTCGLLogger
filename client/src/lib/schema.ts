import { z } from "zod";
import { pgTable, varchar, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  player1: text("player1").notNull(),
  player2: text("player2").notNull(),
  winner: text("winner").notNull(),
  firstPlayer: text("first_player"), // Who went first
  turns: integer("turns").notNull(),
  player1Pokemon: text("player1_pokemon").array().notNull(),
  player2Pokemon: text("player2_pokemon").array().notNull(),
  player1Cards: text("player1_cards").array().default([]),
  player2Cards: text("player2_cards").array().default([]),
  player1Prizes: integer("player1_prizes").default(0).notNull(),
  player2Prizes: integer("player2_prizes").default(0).notNull(),
  // New damage tracking fields
  player1TotalDamage: integer("player1_total_damage").default(0),
  player2TotalDamage: integer("player2_total_damage").default(0),
  attacksUsed: jsonb("attacks_used").default([]), // [{pokemon: "Charizard", attack: "Fire Blast", damage: 120, turn: 3, player: "player1"}]
  winCondition: text("win_condition"), // How the winner won: "Prize cards", "Opponent conceded", "Deck out", etc.
  uploader: text("uploader"), // Player name who uploaded the match
  fullLog: text("full_log").notNull(),
  notes: text("notes").default(""),
  tags: text("tags").array().default([]),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
});

export const decks = pgTable("decks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  playerName: text("player_name").notNull(),
  pokemonCards: text("pokemon_cards").array().notNull(), // ["3 Marnie's Impidimp DRI 134", ...]
  trainerCards: text("trainer_cards").array().notNull(),
  energyCards: text("energy_cards").array().notNull(),
  totalCards: integer("total_cards").default(60).notNull(),
  deckList: text("deck_list").notNull(), // Full formatted deck list
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMatchSchema = z.object({
  title: z.string(),
  player1: z.string(),
  player2: z.string(),
  winner: z.string(),
  firstPlayer: z.string().nullable(),
  turns: z.number(),
  player1Pokemon: z.array(z.string()),
  player2Pokemon: z.array(z.string()),
  player1Cards: z.array(z.string()),
  player2Cards: z.array(z.string()),
  player1Prizes: z.number(),
  player2Prizes: z.number(),
  player1TotalDamage: z.number(),
  player2TotalDamage: z.number(),
  attacksUsed: z.array(z.any()),
  winCondition: z.string().nullable(),
  uploader: z.string().nullable(),
  fullLog: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
  fileSize: z.number(),
});

export const updateMatchSchema = z.object({
  title: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
  player1Pokemon: z.array(z.string()),
  player2Pokemon: z.array(z.string()),
  player1Cards: z.array(z.string()),
  player2Cards: z.array(z.string()),
  winCondition: z.string().nullable(),
}).partial();

export const insertDeckSchema = z.object({
  matchId: z.string(),
  playerName: z.string(),
  pokemonCards: z.array(z.string()),
  trainerCards: z.array(z.string()),
  energyCards: z.array(z.string()),
  totalCards: z.number(),
  deckList: z.string(),
});

export const deckImportSchema = z.object({
  matchId: z.string(),
  playerName: z.string(),
  deckList: z.string().min(1, "Deck list is required"),
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type UpdateMatch = z.infer<typeof updateMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertDeck = z.infer<typeof insertDeckSchema>;
export type Deck = typeof decks.$inferSelect;
export type DeckImport = z.infer<typeof deckImportSchema>;

// Password verification schema
export const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type PasswordVerification = z.infer<typeof passwordSchema>;

// Relations
export const matchesRelations = relations(matches, ({ many }) => ({
  decks: many(decks),
}));

export const decksRelations = relations(decks, ({ one }) => ({
  match: one(matches, {
    fields: [decks.matchId],
    references: [matches.id],
  }),
}));

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({ indexes: [index("IDX_session_expire").on(table.expire)] }),
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  playerName: varchar("player_name"), // Pokemon TCG player name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User profile update schema - playerName is now required
export const updateUserProfileSchema = z.object({
  playerName: z.string().min(1, "El nombre de jugador es obligatorio").max(50, "El nombre de jugador no puede exceder 50 caracteres").trim(),
});

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;