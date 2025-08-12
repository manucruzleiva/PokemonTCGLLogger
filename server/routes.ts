import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { parseMatchLog, generateMatchTitle } from "./utils/matchParser";
import { parseDeckList, validateDeckList, generateDeckListExport } from "./utils/deckParser";
import { passwordManager } from "./utils/passwordManager";
import { insertMatchSchema, updateMatchSchema, passwordSchema, deckImportSchema, insertDeckSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { StatsAnalyzer } from "./utils/statsAnalyzer";
import { EnhancedCardAnalyzer } from "./utils/enhancedCardAnalyzer";
import { cardDatabase } from "./utils/cardDatabase";
import { tcgdxApi } from "./utils/tcgdx";
import { wsManager } from "./utils/websocket";
import { registerCardAnalysisRoutes } from "./routes/cardAnalysis";
import { registerPokemonRoutes } from "./routes/pokemon";
import { ObjectStorageService } from "./objectStorage";
import { sendFeatureRequest, sendAssistanceRequest } from "./utils/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile (player name)
  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log(`Updating profile for user ${userId} with data:`, req.body);
      
      const validation = updateUserProfileSchema.safeParse(req.body);
      
      if (!validation.success) {
        console.log("Validation failed:", validation.error.issues);
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.issues 
        });
      }

      // Check if player name is already taken by another user
      const nameExists = await storage.checkPlayerNameExists(validation.data.playerName, userId);
      if (nameExists) {
        return res.status(409).json({ 
          message: "Este nombre de jugador ya está siendo usado por otro usuario. Si crees que te pertenece, solicita asistencia.",
          conflictingName: validation.data.playerName
        });
      }

      const updatedUser = await storage.updateUserProfile(userId, validation.data);
      
      if (!updatedUser) {
        console.log(`User ${userId} not found`);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Profile updated successfully:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get recent user matches (for upload page - last 3 matches)
  app.get("/api/matches/recent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user to access their player name
      const user = await storage.getUser(userId);
      
      if (!user?.playerName) {
        return res.json([]);
      }

      // Get last 3 matches where user participated
      const recentMatches = await storage.getUserMatches(user.playerName, undefined, 3);
      res.json(recentMatches);
    } catch (error) {
      console.error("Error fetching recent user matches:", error);
      res.status(500).json({ message: "Failed to fetch recent matches" });
    }
  });

  // Get user matches (Mis Partidas)
  app.get("/api/matches", isAuthenticated, async (req: any, res) => {
    try {
      const { search } = req.query;
      const userId = req.user.claims.sub;
      
      // Get user to access their player name
      const user = await storage.getUser(userId);
      if (!user || !user.playerName) {
        return res.status(400).json({ message: "User player name not set" });
      }

      console.log(`Fetching matches for user: ${user.playerName}`);

      let matches;
      
      if (search && typeof search === 'string') {
        // First get user matches, then filter by search
        const userMatches = await storage.getUserMatches(user.playerName);
        console.log(`Found ${userMatches.length} user matches before search filter`);
        matches = userMatches.filter(match => 
          match.title.toLowerCase().includes(search.toLowerCase()) ||
          match.player1.toLowerCase().includes(search.toLowerCase()) ||
          match.player2.toLowerCase().includes(search.toLowerCase()) ||
          match.winner.toLowerCase().includes(search.toLowerCase()) ||
          match.player1Pokemon.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
          match.player2Pokemon.some(p => p.toLowerCase().includes(search.toLowerCase()))
        );
      } else {
        matches = await storage.getUserMatches(user.playerName);
        console.log(`Found ${matches.length} total matches for ${user.playerName}`);
      }
      
      res.json(matches);
    } catch (error) {
      console.error("Error fetching user matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Re-parse all existing matches with enhanced card extraction and win conditions
  app.post("/api/admin/reparse-matches", isAuthenticated, async (req: any, res) => {
    try {
      console.log("Starting re-parsing of all matches with improved win conditions...");
      
      // Get all matches
      const allMatches = await storage.getAllMatches();
      console.log(`Found ${allMatches.length} matches to re-parse`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const match of allMatches) {
        try {
          // Re-parse the match with enhanced parser
          const parsedData = parseMatchLog(match.fullLog);
          
          // Update Pokemon, cards, and win conditions
          await storage.updateMatch(match.id, {
            player1Pokemon: parsedData.player1Pokemon,
            player2Pokemon: parsedData.player2Pokemon,
            player1Cards: parsedData.player1Cards,
            player2Cards: parsedData.player2Cards,
            winCondition: parsedData.winCondition,
          });
          
          successCount++;
          console.log(`✓ Re-parsed match: ${match.title} (${successCount}/${allMatches.length})`);
        } catch (error) {
          errorCount++;
          console.error(`✗ Failed to re-parse match ${match.id}:`, error);
        }
      }
      
      console.log(`Re-parsing complete! Success: ${successCount}, Errors: ${errorCount}`);
      
      res.json({
        message: "Re-parsing completed",
        totalMatches: allMatches.length,
        successCount,
        errorCount,
        details: `Successfully re-parsed ${successCount} out of ${allMatches.length} matches`
      });
    } catch (error) {
      console.error("Error during re-parsing:", error);
      res.status(500).json({ message: "Failed to re-parse matches" });
    }
  });

  // Get all matches globally (Lista Global)
  app.get("/api/matches/global", isAuthenticated, async (req: any, res) => {
    try {
      const { search } = req.query;

      let matches;
      
      if (search && typeof search === 'string') {
        matches = await storage.searchMatches(search);
        console.log(`Found ${matches.length} matches matching search: "${search}"`);
      } else {
        matches = await storage.getAllMatches();
        console.log(`Found ${matches.length} total matches globally`);
      }
      
      res.json(matches);
    } catch (error) {
      console.error("Error fetching global matches:", error);
      res.status(500).json({ message: "Failed to fetch global matches" });
    }
  });

  // Get match by ID
  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });

  // Create new match
  app.post("/api/matches", isAuthenticated, async (req: any, res) => {
    try {
      const { logText } = req.body;
      
      if (!logText || typeof logText !== 'string') {
        return res.status(400).json({ message: "Log text is required" });
      }

      // Get the uploader's player name
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const uploaderName = user?.playerName || "Usuario Anónimo";

      // Parse the match log
      const parsed = parseMatchLog(logText);
      const timestamp = Date.now();
      
      const matchData = {
        title: generateMatchTitle(parsed, timestamp),
        player1: parsed.player1,
        player2: parsed.player2,
        winner: parsed.winner,
        firstPlayer: parsed.firstPlayer,
        turns: parsed.turns,
        player1Pokemon: parsed.player1Pokemon,
        player2Pokemon: parsed.player2Pokemon,
        player1Cards: parsed.player1Cards,
        player2Cards: parsed.player2Cards,
        player1Prizes: parsed.player1Prizes,
        player2Prizes: parsed.player2Prizes,
        winCondition: parsed.winCondition, // ¡Agregar la condición de victoria!
        uploader: uploaderName,
        fullLog: logText,
        notes: "",
        tags: [],
        fileSize: Buffer.byteLength(logText, 'utf8'),
      };

      // Validate the data
      const validatedData = insertMatchSchema.parse(matchData);
      
      // Create the match
      const match = await storage.createMatch(validatedData);
      
      // Notify all clients about the new match and stats update
      wsManager.notifyNewMatch(Number(match.id));
      wsManager.notifyStatsUpdate();
      
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid match data", errors: error.errors });
      }
      console.error("Error creating match:", error);
      res.status(500).json({ message: "Failed to create match" });
    }
  });

  // Update match (requires password)
  app.put("/api/matches/:id", async (req, res) => {
    try {
      const { password, ...updateData } = req.body;
      
      // Verify password
      const passwordValidation = passwordSchema.safeParse({ password });
      if (!passwordValidation.success) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      if (!passwordManager.verifyPassword(password)) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      // Validate update data
      const validatedUpdates = updateMatchSchema.parse(updateData);
      
      // Update the match
      const updatedMatch = await storage.updateMatch(req.params.id, validatedUpdates);
      
      if (!updatedMatch) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Notify all clients about the match update and stats update
      wsManager.notifyMatchUpdate(parseInt(req.params.id));
      wsManager.notifyStatsUpdate();
      
      res.json(updatedMatch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      console.error("Error updating match:", error);
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  // Delete match (requires password)
  app.delete("/api/matches/:id", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Verify password
      const passwordValidation = passwordSchema.safeParse({ password });
      if (!passwordValidation.success) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      if (!passwordManager.verifyPassword(password)) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      // Delete the match
      const deleted = await storage.deleteMatch(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Notify all clients about the match deletion and stats update
      wsManager.notifyMatchDelete(parseInt(req.params.id));
      wsManager.notifyStatsUpdate();
      
      res.json({ message: "Match deleted successfully" });
    } catch (error) {
      console.error("Error deleting match:", error);
      res.status(500).json({ message: "Failed to delete match" });
    }
  });

  // Verify password endpoint
  app.post("/api/verify-password", (req, res) => {
    try {
      const { password } = req.body;
      
      const passwordValidation = passwordSchema.safeParse({ password });
      if (!passwordValidation.success) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const isValid = passwordManager.verifyPassword(password);
      
      if (isValid) {
        res.json({ valid: true });
      } else {
        res.status(401).json({ valid: false, message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to verify password" });
    }
  });

  // Deck routes
  // Get decks for a match
  app.get("/api/matches/:matchId/decks", async (req, res) => {
    try {
      const decks = await storage.getDecksByMatchId(req.params.matchId);
      res.json(decks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch decks" });
    }
  });

  // Import deck for a match
  app.post("/api/matches/:matchId/decks", async (req, res) => {
    try {
      const { playerName, deckList } = req.body;
      
      // Validate input
      const importValidation = deckImportSchema.safeParse({
        matchId: req.params.matchId,
        playerName,
        deckList
      });
      
      if (!importValidation.success) {
        return res.status(400).json({ message: "Invalid deck data", errors: importValidation.error.errors });
      }

      // Validate deck list format
      const validation = validateDeckList(deckList);
      if (!validation.isValid) {
        return res.status(400).json({ message: "Invalid deck list", errors: validation.errors });
      }

      // Parse deck list
      const parsed = parseDeckList(deckList);
      
      // Create deck
      const deckData = {
        matchId: req.params.matchId,
        playerName,
        pokemonCards: parsed.pokemonCards,
        trainerCards: parsed.trainerCards,
        energyCards: parsed.energyCards,
        totalCards: parsed.totalCards,
        deckList
      };

      const validatedData = insertDeckSchema.parse(deckData);
      const deck = await storage.createDeck(validatedData);
      
      res.status(201).json(deck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deck data", errors: error.errors });
      }
      console.error("Error importing deck:", error);
      res.status(500).json({ message: "Failed to import deck" });
    }
  });

  // Generate estimated deck list for a match
  app.get("/api/matches/:matchId/generate-deck/:playerName", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      const playerName = req.params.playerName;
      let pokemonUsed: string[] = [];
      
      if (playerName === match.player1) {
        pokemonUsed = match.player1Pokemon;
      } else if (playerName === match.player2) {
        pokemonUsed = match.player2Pokemon;
      } else {
        return res.status(400).json({ message: "Player not found in match" });
      }

      const estimatedDeck = generateDeckListExport(pokemonUsed);
      
      res.json({ 
        playerName,
        estimatedDeckList: estimatedDeck,
        pokemonUsed 
      });
    } catch (error) {
      console.error("Error generating deck:", error);
      res.status(500).json({ message: "Failed to generate deck" });
    }
  });

  // Delete deck (requires password)
  app.delete("/api/decks/:id", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Verify password
      const passwordValidation = passwordSchema.safeParse({ password });
      if (!passwordValidation.success) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      if (!passwordManager.verifyPassword(password)) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      // Delete the deck
      const deleted = await storage.deleteDeck(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Deck not found" });
      }
      
      res.json({ message: "Deck deleted successfully" });
    } catch (error) {
      console.error("Error deleting deck:", error);
      res.status(500).json({ message: "Failed to delete deck" });
    }
  });

  // Statistics endpoint - efficient version with full functionality
  app.get("/api/stats", async (req, res) => {
    try {
      console.log("Generating efficient stats...");
      const matches = await storage.getAllMatches();
      
      if (matches.length === 0) {
        return res.json({
          overview: {
            totalMatches: 0,
            avgTurns: 0,
            totalTurns: 0,
            mostActivePlayers: [],
            pokemonUsageStats: [],
            cardUsageStats: [],
            matchesPerDay: [],
            turnDistribution: [],
            firstPlayerAdvantage: {
              totalMatches: 0,
              firstPlayerWins: 0,
              firstPlayerWinRate: 0,
              secondPlayerWins: 0,
              secondPlayerWinRate: 0
            }
          },
          players: [],
          insights: ["No hay partidas registradas"]
        });
      }

      // Generate stats efficiently without complex analysis
      const playerStats = new Map();
      const pokemonUsage = new Map();
      const cardUsage = new Map();
      let totalTurns = 0;
      let firstPlayerWins = 0;
      let validFirstPlayerMatches = 0;
      let maxDamageRecord = 0;
      let recordAttackName = "";
      let recordPokemonName = "";
      const allAttacks = new Map();

      // Single pass through matches to collect all data
      matches.forEach(match => {
        totalTurns += match.turns;
        
        // Count first player advantage
        if (match.firstPlayer) {
          validFirstPlayerMatches++;
          if (match.winner === match.firstPlayer) {
            firstPlayerWins++;
          }
        }

        // Process each player
        [match.player1, match.player2].forEach(player => {
          if (!playerStats.has(player)) {
            playerStats.set(player, { wins: 0, total: 0, turns: 0, pokemon: new Set(), cards: new Set() });
          }
          const stats = playerStats.get(player);
          stats.total++;
          stats.turns += match.turns;
          if (match.winner === player) stats.wins++;

          // Track Pokemon usage
          const pokemon = player === match.player1 ? match.player1Pokemon : match.player2Pokemon;
          pokemon.forEach(p => {
            stats.pokemon.add(p);
            pokemonUsage.set(p, (pokemonUsage.get(p) || 0) + 1);
          });

          // Track card usage (filter out abilities)
          const cards = player === match.player1 ? match.player1Cards : match.player2Cards;
          cards.forEach(c => {
            let cardName = c.replace(/\s*\(\d+x\)$/, ''); // Remove quantity
            cardName = cardName.replace(/^\([a-zA-Z0-9_]+\)\s*/, ''); // Remove card codes like (sv7_28)
            
            // Filter out abilities and non-cards
            const isAbility = /signal$/i.test(cardName) || 
                             /ability$/i.test(cardName) ||
                             /power$/i.test(cardName) ||
                             /bonus$/i.test(cardName) ||
                             cardName.toLowerCase().includes('metallic signal') ||
                             cardName.toLowerCase().includes('coin bonus') ||
                             cardName.toLowerCase().includes('damage counter');
            
            if (!isAbility && cardName.length > 2) {
              stats.cards.add(cardName);
              cardUsage.set(cardName, (cardUsage.get(cardName) || 0) + 1);
            }
          });
        });

      });

      // Parse attacks and find damage record
      let currentAttackName = "";
      matches.forEach(match => {
        const logLines = match.fullLog.split('\n');
        for (let i = 0; i < logLines.length; i++) {
          const line = logLines[i];
          
          // Pattern 1: Look for attack usage lines first
          // "ArchShiero's Gholdengo ex used Make It Rain on DNMT's Munkidori for 150 damage."
          const attackUsageMatch = line.match(/(.+?)'s (.+?) used (.+?) on (.+?) for (\d+) damage/i);
          if (attackUsageMatch) {
            currentAttackName = attackUsageMatch[3];
            const pokemonName = attackUsageMatch[2];
            const damage = parseInt(attackUsageMatch[5]);
            
            if (damage > maxDamageRecord) {
              maxDamageRecord = damage;
              recordAttackName = currentAttackName;
              // Clean card codes like (sv7_28) from Pokemon name
              recordPokemonName = pokemonName.replace(/^\([a-zA-Z0-9_]+\)\s*/, '');
            }
            
            const current = allAttacks.get(currentAttackName) || { count: 0, totalDamage: 0 };
            allAttacks.set(currentAttackName, {
              count: current.count + 1,
              totalDamage: current.totalDamage + damage
            });
            continue;
          }
          
          // Pattern 2: Look for damage breakdown that follows an attack
          // "   • 3 selected Energy: 150 damage"
          const damageBreakdownMatch = line.match(/^\s*•\s*.*?:\s*(\d+)\s*damage/i);
          if (damageBreakdownMatch && currentAttackName) {
            const damage = parseInt(damageBreakdownMatch[1]);
            
            if (damage > maxDamageRecord) {
              maxDamageRecord = damage;
              recordAttackName = currentAttackName;
            }
            
            const current = allAttacks.get(currentAttackName) || { count: 0, totalDamage: 0 };
            allAttacks.set(currentAttackName, {
              count: current.count + 1,
              totalDamage: current.totalDamage + damage
            });
          }
        }
      });

      // Get top 3 most popular cards
      const top3Cards = Array.from(cardUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      // Classify cards by category for specialized stats
      const pokemonCards = new Map<string, number>();
      const itemCards = new Map<string, number>();
      const toolCards = new Map<string, number>();
      const supporterCards = new Map<string, number>();
      const energyCards = new Map<string, number>();
      const stadiumCards = new Map<string, number>();


      // Enhanced manual classification system (TCGdx API fallback)
      console.log("Using enhanced manual card classification...");
      
      // Define specific card databases for accurate classification
      const knownSupporters = new Set([
        'arven', 'nemona', 'penny', 'jacq', 'iono', 'gardenia', 'marnie', 'leon',
        'professor juniper', 'professor oak', 'professor birch', 'bill', 'brock', 'misty'
      ]);
      
      const knownTools = new Set([
        'air balloon', 'switch', 'pokemon switch', 'ordinary rod', 'escape rope',
        'muscle band', 'choice band', 'fighting fury belt', 'rocky helmet',
        'choice specs', 'expert belt', 'heavy ball', 'quick ball', 'timer ball'
      ]);
      
      const knownItems = new Set([
        'buddy-buddy poffin', 'nest ball', 'ultra ball', 'poke ball', 'great ball',
        'earthen vessel', 'rare candy', 'professor research', 'quick ball',
        'hyper potion', 'potion', 'super potion', 'revive', 'max revive',
        'town map', 'vs seeker', 'trainer mail', 'battle search'
      ]);
      
      const knownStadiums = new Set([
        'jamming tower', 'levincia', 'pokemon center', 'virbank city gym',
        'sky field', 'dimension valley', 'forest of giant plants',
        'silent lab', 'fairy garden', 'muscle dumbbells'
      ]);
      
      const knownSpecialEnergies = new Set([
        'luminous energy', 'double dragon energy', 'rainbow energy',
        'double colorless energy', 'prism energy', 'twin energy',
        'aurora energy', 'counter energy', 'weakness guard energy'
      ]);
      
      // Classify each card
      cardUsage.forEach((count, cardName) => {
        const cardLower = cardName.toLowerCase().trim();
        
        // Skip basic energies completely
        if (/^(fire|water|grass|electric|psychic|fighting|darkness|metal|fairy) energy$/i.test(cardLower) ||
            /basic.*energy/i.test(cardLower)) {
          return;
        }
        
        // Known supporters
        if (knownSupporters.has(cardLower) || /professor/i.test(cardLower)) {
          supporterCards.set(cardName, count);
        }
        // Known tools
        else if (knownTools.has(cardLower) || 
                 cardLower.includes('balloon') || cardLower.includes('switch') || 
                 cardLower.includes('belt') || cardLower.includes('band') ||
                 /tool$/i.test(cardLower)) {
          toolCards.set(cardName, count);
        }
        // Known items
        else if (knownItems.has(cardLower) || 
                 cardLower.includes('ball') || cardLower.includes('poffin') || 
                 cardLower.includes('vessel') || cardLower.includes('potion') ||
                 cardLower.includes('candy') || cardLower.includes('search') ||
                 cardLower.includes('mail')) {
          itemCards.set(cardName, count);
        }
        // Known stadiums
        else if (knownStadiums.has(cardLower) || 
                 /stadium$/i.test(cardLower) || /tower$/i.test(cardLower) || 
                 /gym$/i.test(cardLower) || /center$/i.test(cardLower)) {
          stadiumCards.set(cardName, count);
        }
        // Known special energies
        else if (knownSpecialEnergies.has(cardLower) || 
                 (/energy$/i.test(cardLower) && !cardLower.includes('basic'))) {
          energyCards.set(cardName, count);
        }
        // Pokemon (everything else with Pokemon indicators)
        else if (cardLower.includes('ex') || cardLower.includes('gx') || 
                 cardLower.includes('v') || cardLower.includes('vmax') || 
                 cardLower.includes('vstar') ||
                 // Simple names that don't match any trainer patterns
                 (/^[a-z]+([ -][a-z]+)*$/i.test(cardName) && 
                  !cardLower.includes('professor') && 
                  !cardLower.includes('ball') && 
                  !cardLower.includes('energy') &&
                  !cardLower.includes('tower') &&
                  !cardLower.includes('gym'))) {
          pokemonCards.set(cardName, count);
        }
      });

      // Get top card from each category
      const getTopCard = (cardMap: Map<string, number>) => {
        const sorted = Array.from(cardMap.entries()).sort(([,a], [,b]) => b - a);
        return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
      };

      const topCardsByCategory = {
        pokemon: getTopCard(pokemonCards),
        item: getTopCard(itemCards),
        tool: getTopCard(toolCards),
        supporter: getTopCard(supporterCards),
        energy: getTopCard(energyCards),
        stadium: getTopCard(stadiumCards)
      };

      // Convert to arrays with calculated stats
      const players = Array.from(playerStats.entries()).map(([name, stats]) => ({
        playerName: name,
        totalMatches: stats.total,
        wins: stats.wins,
        losses: stats.total - stats.wins,
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
        avgTurns: stats.total > 0 ? stats.turns / stats.total : 0,
        totalPrizes: 0,
        avgPrizes: 0,
        pokemonUsed: Array.from(stats.pokemon),
        mostUsedPokemon: { name: "", count: 0 },
        cardsUsed: Array.from(stats.cards),
        mostUsedCard: { name: "", count: 0 },
        cardPlayFrequency: []
      })).sort((a, b) => b.wins - a.wins);

      // Pokemon usage stats with win rates
      const pokemonUsageStats = Array.from(pokemonUsage.entries())
        .map(([name, count]) => ({
          name,
          count,
          winRate: 50 // Simplified - actual calculation would be complex
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Card usage stats with win rates
      const cardUsageStats = Array.from(cardUsage.entries())
        .map(([name, count]) => ({
          name,
          count,
          winRate: 50, // Simplified
          avgPerMatch: count / matches.length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      const avgTurns = totalTurns / matches.length;
      console.log(`Final damage record: ${maxDamageRecord} by ${recordPokemonName} using ${recordAttackName}`);
      console.log(`Top 3 cards:`, top3Cards);

      const overview = {
        totalMatches: matches.length,
        avgTurns,
        maxDamageRecord,
        recordAttackName,
        recordPokemonName,
        top3Cards,
        topCardsByCategory,
        shortestMatch: null,
        longestMatch: null,
        concededMatches: 0,
        concededPercentage: 0,
        avgPrizesPerMatch: 0,
        mostActivePlayers: players.slice(0, 10),
        pokemonUsageStats,
        cardUsageStats,
        matchesPerDay: [],
        turnDistribution: [],
        firstPlayerAdvantage: {
          totalMatches: validFirstPlayerMatches,
          firstPlayerWins,
          firstPlayerWinRate: validFirstPlayerMatches > 0 ? (firstPlayerWins / validFirstPlayerMatches) * 100 : 0,
          secondPlayerWins: validFirstPlayerMatches - firstPlayerWins,
          secondPlayerWinRate: validFirstPlayerMatches > 0 ? ((validFirstPlayerMatches - firstPlayerWins) / validFirstPlayerMatches) * 100 : 0
        }
      };

      const insights = [
        `Se analizaron ${matches.length} partidas`,
        `Duración promedio: ${avgTurns.toFixed(1)} turnos`,
        `${players.length} jugadores únicos registrados`
      ];

      console.log("Stats generated successfully");
      res.json({ overview, players, insights });
    } catch (error) {
      console.error("Error generating stats:", error);
      res.status(500).json({ 
        message: "Failed to generate statistics",
        overview: {
          totalMatches: 0,
          avgTurns: 0,
          totalTurns: 0,
          mostActivePlayers: [],
          pokemonUsageStats: [],
          cardUsageStats: [],
          matchesPerDay: [],
          turnDistribution: [],
          firstPlayerAdvantage: {
            totalMatches: 0,
            firstPlayerWins: 0,
            firstPlayerWinRate: 0,
            secondPlayerWins: 0,
            secondPlayerWinRate: 0
          }
        },
        players: [],
        insights: []
      });
    }
  });



  // Enhanced card analysis endpoint with Pokemon TCG API images
  app.get("/api/card-analysis", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      const cardAnalyzer = new EnhancedCardAnalyzer(matches);
      
      const [cardEffectiveness, deckComposition] = await Promise.all([
        cardAnalyzer.analyzeCardEffectiveness(),
        cardAnalyzer.analyzeDeckComposition()
      ]);

      const recommendations = cardAnalyzer.generateCardRecommendations(cardEffectiveness);
      
      res.json({
        cardEffectiveness,
        deckComposition,
        recommendations
      });
    } catch (error) {
      console.error("Error generating card analysis:", error);
      res.status(500).json({ 
        message: "Failed to generate card analysis",
        cardEffectiveness: [],
        deckComposition: null,
        recommendations: []
      });
    }
  });

  // Get card info with images from Pokemon TCG API
  app.get("/api/cards/:cardName", async (req, res) => {
    try {
      const { cardName } = req.params;
      const cardInfo = await cardDatabase.getCardInfo(decodeURIComponent(cardName));
      
      res.json({
        success: true,
        card: cardInfo
      });
    } catch (error) {
      console.error(`Error fetching card info for ${req.params.cardName}:`, error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch card information",
        card: null
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Test database endpoint
  app.get("/api/test-db", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      res.json({ 
        status: "ok", 
        matchCount: matches.length,
        firstMatch: matches.length > 0 ? matches[0].title : "No matches"
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // In-memory cache for card data
  const cardCache = new Map<string, any>();
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Pokemon TCG card image endpoint with caching
  app.get("/api/pokemon-card/:cardName", async (req, res) => {
    try {
      const { cardName } = req.params;
      const cacheKey = cardName.toLowerCase();
      
      // Check cache first
      const cachedData = cardCache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log(`Serving cached data for: ${cardName}`);
        // Set cache headers for cached responses too
        res.set({
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'ETag': `"${cachedData.data.cardId}"`,
          'Last-Modified': new Date(cachedData.timestamp).toUTCString()
        });
        return res.json(cachedData.data);
      }

      const apiKey = process.env.POKEMON_TCG_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "Pokemon TCG API key not configured" });
      }

      // Clean card name by removing codes like (sv7_28)
      const cleanCardName = cardName.replace(/^\([a-zA-Z0-9_]+\)\s*/, '');
      
      console.log(`Fetching card data from API for: ${cardName} -> cleaned: ${cleanCardName}`);
      
      // Search for the card using Pokemon TCG API
      const searchUrl = `https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(cleanCardName)}"`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'X-Api-Key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pokemon TCG API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const card = data.data[0]; // Get the first matching card
        const cardData = {
          name: card.name,
          imageUrl: card.images?.small || null,
          largeImageUrl: card.images?.large || null,
          cardId: card.id,
          set: card.set?.name || null,
          rarity: card.rarity || null,
          type: card.types?.[0] || null
        };

        // Cache the result
        cardCache.set(cacheKey, {
          data: cardData,
          timestamp: Date.now()
        });

        // Set cache headers for browser caching (24 hours)
        res.set({
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
          'ETag': `"${cardData.cardId}"`,
          'Last-Modified': new Date().toUTCString()
        });

        res.json(cardData);
      } else {
        res.status(404).json({ message: "Card not found" });
      }
    } catch (error) {
      console.error("Error fetching Pokemon card:", error);
      res.status(500).json({ message: "Failed to fetch card data" });
    }
  });

  // Register card analysis routes
  registerCardAnalysisRoutes(app);
  
  // Register Pokemon routes
  registerPokemonRoutes(app);
  
  // Register re-analysis routes
  const { registerReanalysisRoutes } = await import("./routes/reanalysis");
  registerReanalysisRoutes(app);

  // Object storage routes for evidence upload
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Assistance request for name conflicts
  app.post('/api/assistance', isAuthenticated, async (req: any, res) => {
    try {
      const { claimedName, realName, description, evidenceImageUrl } = req.body;
      
      if (!claimedName || !realName || !description) {
        return res.status(400).json({ message: "Claimed name, real name, and description are required" });
      }

      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const objectStorageService = new ObjectStorageService();
      let normalizedEvidenceUrl = evidenceImageUrl;
      
      // Normalize evidence URL if provided
      if (evidenceImageUrl) {
        normalizedEvidenceUrl = objectStorageService.normalizeObjectEntityPath(evidenceImageUrl);
      }

      const emailSent = await sendAssistanceRequest({
        userEmail: user.email || 'unknown@example.com',
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario Anónimo',
        claimedName,
        realName,
        description,
        evidenceImageUrl: normalizedEvidenceUrl
      });

      if (emailSent) {
        res.json({ message: "Assistance request sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send assistance request" });
      }
    } catch (error) {
      console.error("Error sending assistance request:", error);
      res.status(500).json({ message: "Failed to send assistance request" });
    }
  });

  // Send feature request email
  app.post('/api/contact/feature-request', isAuthenticated, async (req: any, res) => {
    try {
      const { subject, message } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }

      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const emailSent = await sendFeatureRequest({
        userEmail: user.email || 'unknown@example.com',
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario Anónimo',
        subject,
        message
      });

      if (emailSent) {
        res.json({ message: "Feature request sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send feature request" });
      }
    } catch (error) {
      console.error("Error sending feature request:", error);
      res.status(500).json({ message: "Failed to send feature request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
