import {
  matches,
  decks,
  users,
  type Match,
  type Deck,
  type User,
  type UpsertUser,
  type InsertMatch,
  type InsertDeck,
  type UpdateMatch,
  type UpdateUserProfile,
  type DeckImport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, or, ilike, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined>;
  checkPlayerNameExists(playerName: string, excludeUserId?: string): Promise<boolean>;
  
  // Match operations
  getAllMatches(): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: UpdateMatch): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;
  searchMatches(query: string): Promise<Match[]>;
  getUserMatches(playerName: string): Promise<Match[]>;
  
  // Deck operations
  getAllDecks(): Promise<Deck[]>;
  getDecksByMatchId(matchId: string): Promise<Deck[]>;
  getDeckById(id: string): Promise<Deck | undefined>;
  createDeck(deck: InsertDeck): Promise<Deck>;
  updateDeck(id: string, updates: Partial<InsertDeck>): Promise<Deck | undefined>;
  deleteDeck(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async checkPlayerNameExists(playerName: string, excludeUserId?: string): Promise<boolean> {
    const conditions = [eq(users.playerName, playerName)];
    if (excludeUserId) {
      conditions.push(sql`${users.id} != ${excludeUserId}`);
    }
    
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(...conditions))
      .limit(1);
    
    return !!existingUser;
  }

  // Match operations
  async getAllMatches(): Promise<Match[]> {
    return await db.select().from(matches).orderBy(desc(matches.uploadedAt));
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values(insertMatch)
      .returning();
    return match;
  }



  async updateMatch(id: string, updates: UpdateMatch): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return match || undefined;
  }

  async deleteMatch(id: string): Promise<boolean> {
    const result = await db.delete(matches).where(eq(matches.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchMatches(query: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(
        or(
          ilike(matches.title, `%${query}%`),
          ilike(matches.player1, `%${query}%`),
          ilike(matches.player2, `%${query}%`),
          ilike(matches.winner, `%${query}%`),
          sql`${matches.player1Pokemon}::text ILIKE ${'%' + query + '%'}`,
          sql`${matches.player2Pokemon}::text ILIKE ${'%' + query + '%'}`,
          sql`${matches.tags}::text ILIKE ${'%' + query + '%'}`
        )
      )
      .orderBy(desc(matches.uploadedAt));
  }

  async getUserMatches(playerName: string, searchQuery?: string, limit?: number): Promise<Match[]> {
    console.log(`Searching for matches with player name: "${playerName}", limit: ${limit}`);
    
    let query = db
      .select()
      .from(matches)
      .where(
        or(
          eq(matches.player1, playerName),
          eq(matches.player2, playerName)
        )
      )
      .orderBy(desc(matches.uploadedAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const result = await query;
    
    console.log(`Database query returned ${result.length} matches`);
    if (result.length > 0) {
      console.log(`Sample match players: player1="${result[0].player1}", player2="${result[0].player2}"`);
    }
    
    return result;
  }

  // Deck operations
  async getAllDecks(): Promise<Deck[]> {
    return await db.select().from(decks).orderBy(desc(decks.createdAt));
  }

  async getDecksByMatchId(matchId: string): Promise<Deck[]> {
    return await db.select().from(decks).where(eq(decks.matchId, matchId));
  }

  async getDeckById(id: string): Promise<Deck | undefined> {
    const [deck] = await db.select().from(decks).where(eq(decks.id, id));
    return deck || undefined;
  }

  async createDeck(insertDeck: InsertDeck): Promise<Deck> {
    const [deck] = await db
      .insert(decks)
      .values(insertDeck)
      .returning();
    return deck;
  }

  async updateDeck(id: string, updates: Partial<InsertDeck>): Promise<Deck | undefined> {
    const [deck] = await db
      .update(decks)
      .set(updates)
      .where(eq(decks.id, id))
      .returning();
    return deck || undefined;
  }

  async deleteDeck(id: string): Promise<boolean> {
    const result = await db.delete(decks).where(eq(decks.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
