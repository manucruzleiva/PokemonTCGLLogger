import type { Match } from "@shared/schema";
import { cardDatabase } from "./cardDatabase";

export interface PlayerStats {
  playerName: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  avgTurns: number;
  totalPrizes: number;
  avgPrizes: number;
  pokemonUsed: string[];
  mostUsedPokemon: { name: string; count: number };
  cardsUsed: string[];
  mostUsedCard: { name: string; count: number };
  cardPlayFrequency: { name: string; count: number; avgPerMatch: number }[];
}

export interface FirstPlayerAdvantage {
  totalMatches: number;
  firstPlayerWins: number;
  firstPlayerWinRate: number;
  secondPlayerWins: number;
  secondPlayerWinRate: number;
}

export interface GameStats {
  totalMatches: number;
  avgTurns: number;
  shortestMatch: { match: Match; turns: number } | null;
  longestMatch: { match: Match; turns: number } | null;
  concededMatches: number;
  concededPercentage: number;
  totalTurns: number;
  avgPrizesPerMatch: number;
  mostActivePlayers: PlayerStats[];
  pokemonUsageStats: { name: string; count: number; winRate: number }[];
  cardUsageStats: { name: string; count: number; winRate: number; avgPerMatch: number }[];
  matchesPerDay: { date: string; count: number }[];
  turnDistribution: { range: string; count: number }[];
  firstPlayerAdvantage: FirstPlayerAdvantage;
}

export class StatsAnalyzer {
  private matches: Match[];

  constructor(matches: Match[]) {
    this.matches = matches;
  }

  analyzePlayerStats(): PlayerStats[] {
    const playerMap = new Map<string, PlayerStats>();

    // Initialize player stats
    this.matches.forEach(match => {
      [match.player1, match.player2].forEach(playerName => {
        if (!playerMap.has(playerName)) {
          playerMap.set(playerName, {
            playerName,
            totalMatches: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            avgTurns: 0,
            totalPrizes: 0,
            avgPrizes: 0,
            pokemonUsed: [],
            mostUsedPokemon: { name: "", count: 0 },
            cardsUsed: [],
            mostUsedCard: { name: "", count: 0 },
            cardPlayFrequency: []
          });
        }
      });
    });

    // Calculate stats for each player
    this.matches.forEach(match => {
      const player1Stats = playerMap.get(match.player1)!;
      const player2Stats = playerMap.get(match.player2)!;

      // Update match counts and wins/losses
      player1Stats.totalMatches++;
      player2Stats.totalMatches++;

      if (match.winner === match.player1) {
        player1Stats.wins++;
        player2Stats.losses++;
      } else {
        player2Stats.wins++;
        player1Stats.losses++;
      }

      // Update prizes
      player1Stats.totalPrizes += match.player1Prizes;
      player2Stats.totalPrizes += match.player2Prizes;

      // Add Pokemon and cards used
      player1Stats.pokemonUsed.push(...match.player1Pokemon);
      player2Stats.pokemonUsed.push(...match.player2Pokemon);
      player1Stats.cardsUsed.push(...(match.player1Cards || []));
      player2Stats.cardsUsed.push(...(match.player2Cards || []));
    });

    // Calculate derived stats
    playerMap.forEach(stats => {
      stats.winRate = stats.totalMatches > 0 ? (stats.wins / stats.totalMatches) * 100 : 0;
      stats.avgPrizes = stats.totalMatches > 0 ? stats.totalPrizes / stats.totalMatches : 0;
      
      // Calculate average turns for this player
      const playerMatches = this.matches.filter(m => 
        m.player1 === stats.playerName || m.player2 === stats.playerName
      );
      stats.avgTurns = playerMatches.length > 0 
        ? playerMatches.reduce((sum, m) => sum + m.turns, 0) / playerMatches.length 
        : 0;

      // Find most used Pokemon
      const pokemonCount = new Map<string, number>();
      stats.pokemonUsed.forEach(pokemon => {
        pokemonCount.set(pokemon, (pokemonCount.get(pokemon) || 0) + 1);
      });

      let maxCount = 0;
      let mostUsed = "";
      pokemonCount.forEach((count, pokemon) => {
        if (count > maxCount) {
          maxCount = count;
          mostUsed = pokemon;
        }
      });

      stats.mostUsedPokemon = { name: mostUsed, count: maxCount };

      // Find most used cards and calculate card frequency
      const cardCount = new Map<string, number>();
      stats.cardsUsed.forEach(cardEntry => {
        // Extract card name without the count (remove the "(Nx)" part)
        let cardName = cardEntry.replace(/\s*\(\d+x\)$/, '');
        // Remove card codes like (sv7_28) at the beginning
        cardName = cardName.replace(/^\([a-zA-Z0-9_]+\)\s*/, '');
        // Extract count from the entry
        const countMatch = cardEntry.match(/\((\d+)x\)$/);
        const count = countMatch ? parseInt(countMatch[1]) : 1;
        cardCount.set(cardName, (cardCount.get(cardName) || 0) + count);
      });

      let maxCardCount = 0;
      let mostUsedCard = "";
      cardCount.forEach((count, card) => {
        if (count > maxCardCount) {
          maxCardCount = count;
          mostUsedCard = card;
        }
      });

      stats.mostUsedCard = { name: mostUsedCard, count: maxCardCount };

      // Calculate card play frequency (average per match)
      stats.cardPlayFrequency = Array.from(cardCount.entries())
        .map(([name, count]) => ({
          name,
          count,
          avgPerMatch: stats.totalMatches > 0 ? count / stats.totalMatches : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 most used cards
    });

    return Array.from(playerMap.values()).sort((a, b) => b.wins - a.wins);
  }

  async analyzeGameStats(): Promise<GameStats> {
    if (this.matches.length === 0) {
      return {
        totalMatches: 0,
        avgTurns: 0,
        shortestMatch: null,
        longestMatch: null,
        concededMatches: 0,
        concededPercentage: 0,
        totalTurns: 0,
        avgPrizesPerMatch: 0,
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
      };
    }

    const totalTurns = this.matches.reduce((sum, match) => sum + match.turns, 0);
    const avgTurns = totalTurns / this.matches.length;

    // Find shortest and longest matches (analyzing all matches regardless of how they ended)
    const shortestMatch = this.matches.length > 0 
      ? this.matches.reduce((shortest, match) => 
          !shortest || match.turns < shortest.match.turns ? { match, turns: match.turns } : shortest,
          { match: this.matches[0], turns: this.matches[0].turns }
        )
      : null;
    
    const longestMatch = this.matches.length > 0
      ? this.matches.reduce((longest, match) => 
          !longest || match.turns > longest.match.turns ? { match, turns: match.turns } : longest,
          { match: this.matches[0], turns: this.matches[0].turns }
        )
      : null;

    // Detect conceded matches (matches with very low prize counts or specific patterns)
    const concededMatches = this.matches.filter(match => {
      const totalPrizes = match.player1Prizes + match.player2Prizes;
      const winnerPrizes = match.winner === match.player1 ? match.player1Prizes : match.player2Prizes;
      // Consider conceded if winner has very few prizes or match ended very quickly with low prizes
      return totalPrizes < 3 || (match.turns < 3 && winnerPrizes < 2);
    }).length;

    const concededPercentage = (concededMatches / this.matches.length) * 100;

    // Calculate average prizes per match
    const totalPrizes = this.matches.reduce((sum, match) => 
      sum + match.player1Prizes + match.player2Prizes, 0
    );
    const avgPrizesPerMatch = totalPrizes / this.matches.length;

    // Get player stats
    const playerStats = this.analyzePlayerStats();

    // Pokemon usage analysis
    const pokemonUsage = new Map<string, { count: number; wins: number; total: number }>();
    
    // Pokemon type dominance analysis
    const typeUsage = new Map<string, { count: number; wins: number; totalDamage: number; attacks: number }>();
    
    this.matches.forEach(match => {
      const allPokemon = [...match.player1Pokemon, ...match.player2Pokemon];
      const winnerPokemon = match.winner === match.player1 ? match.player1Pokemon : match.player2Pokemon;
      
      allPokemon.forEach(pokemon => {
        if (!pokemonUsage.has(pokemon)) {
          pokemonUsage.set(pokemon, { count: 0, wins: 0, total: 0 });
        }
        pokemonUsage.get(pokemon)!.count++;
        pokemonUsage.get(pokemon)!.total++;
      });

      winnerPokemon.forEach(pokemon => {
        if (pokemonUsage.has(pokemon)) {
          pokemonUsage.get(pokemon)!.wins++;
        }
      });
    });

    const pokemonUsageStats = Array.from(pokemonUsage.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 most used

    // Analyze Pokemon type dominance using card database
    for (const match of this.matches) {
      const allPokemon = [...match.player1Pokemon, ...match.player2Pokemon];
      const winnerPokemon = match.winner === match.player1 ? match.player1Pokemon : match.player2Pokemon;
      
      // Get total damage for each player
      const player1Damage = match.player1TotalDamage || 0;
      const player2Damage = match.player2TotalDamage || 0;
      const attacks = match.attacksUsed || [];
      
      // Process each Pokemon to get type information
      for (const pokemonName of allPokemon) {
        const cardInfo = cardInfoMap.get(pokemonName);
        const pokemonType = cardInfo?.pokemonType || 'Colorless';
        
        if (!typeUsage.has(pokemonType)) {
          typeUsage.set(pokemonType, { count: 0, wins: 0, totalDamage: 0, attacks: 0 });
        }
        
        const typeStats = typeUsage.get(pokemonType)!;
        typeStats.count++;
        
        // Add damage from attacks by this type
        const typeAttacks = attacks.filter(attack => 
          attack.pokemon.includes(pokemonName) || pokemonName.includes(attack.pokemon)
        );
        
        typeAttacks.forEach(attack => {
          typeStats.totalDamage += attack.damage;
          typeStats.attacks++;
        });
        
        // Check if this type was on the winning side
        if (winnerPokemon.includes(pokemonName)) {
          typeStats.wins++;
        }
      }
    }

    const typeDominanceStats = Array.from(typeUsage.entries())
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        winRate: stats.count > 0 ? (stats.wins / stats.count) * 100 : 0,
        totalDamage: stats.totalDamage,
        avgDamagePerUse: stats.count > 0 ? stats.totalDamage / stats.count : 0,
        attacksCount: stats.attacks,
        effectiveness: stats.winRate >= 60 ? 'High' : stats.winRate >= 40 ? 'Medium' : 'Low'
      }))
      .sort((a, b) => b.totalDamage - a.totalDamage);

    // Enhanced card usage analysis with Pokemon TCG API data
    const cardUsage = new Map<string, { count: number; wins: number; total: number; matchCount: number }>();
    
    this.matches.forEach(match => {
      const allCards = [...(match.player1Cards || []), ...(match.player2Cards || [])];
      const winnerCards = match.winner === match.player1 ? (match.player1Cards || []) : (match.player2Cards || []);
      
      allCards.forEach(cardEntry => {
        // Extract card name without the count
        const cardName = cardEntry.replace(/\s*\(\d+x\)$/, '');
        // Extract count from the entry
        const countMatch = cardEntry.match(/\((\d+)x\)$/);
        const count = countMatch ? parseInt(countMatch[1]) : 1;
        
        if (!cardUsage.has(cardName)) {
          cardUsage.set(cardName, { count: 0, wins: 0, total: 0, matchCount: 0 });
        }
        cardUsage.get(cardName)!.count += count;
        cardUsage.get(cardName)!.total += count;
        cardUsage.get(cardName)!.matchCount++;
      });

      winnerCards.forEach(cardEntry => {
        const cardName = cardEntry.replace(/\s*\(\d+x\)$/, '');
        const countMatch = cardEntry.match(/\((\d+)x\)$/);
        const count = countMatch ? parseInt(countMatch[1]) : 1;
        
        if (cardUsage.has(cardName)) {
          cardUsage.get(cardName)!.wins += count;
        }
      });
    });

    // Get card information from the Pokemon TCG API
    const cardNames = Array.from(cardUsage.keys());
    const cardInfoMap = await cardDatabase.getMultipleCardInfo(cardNames);
    
    const cardUsageStats = Array.from(cardUsage.entries())
      .filter(([name, stats]) => stats.matchCount >= 2) // Only cards used in at least 2 matches
      .map(([name, stats]) => {
        const cardInfo = cardInfoMap.get(name);
        return {
          name,
          count: stats.count,
          winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
          avgPerMatch: stats.matchCount > 0 ? stats.count / stats.matchCount : 0,
          cardType: cardInfo?.supertype || "Unknown",
          isTrainer: cardInfo?.isTrainer || false,
          isPokemon: cardInfo?.isPokemon || false,
          isEnergy: cardInfo?.isEnergy || false,
          trainerCategory: cardInfo?.trainerCategory,
          pokemonType: cardInfo?.pokemonType,
          imageUrl: cardInfo?.imageUrl,
          largeImageUrl: cardInfo?.largeImageUrl,
          cardId: cardInfo?.cardId
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 25); // Top 25 most used cards

    // Attack and damage analysis
    const totalAttacks = this.matches.reduce((sum, match) => 
      sum + (match.attacksUsed?.length || 0), 0
    );
    
    const totalDamageDealt = this.matches.reduce((sum, match) => 
      sum + (match.player1TotalDamage || 0) + (match.player2TotalDamage || 0), 0
    );
    
    const avgDamagePerMatch = this.matches.length > 0 ? totalDamageDealt / this.matches.length : 0;
    const avgAttacksPerMatch = this.matches.length > 0 ? totalAttacks / this.matches.length : 0;

    // Most damaging attacks
    const allAttacks = this.matches.flatMap(match => match.attacksUsed || []);
    const attackStats = new Map<string, { count: number; totalDamage: number; avgDamage: number }>();
    
    allAttacks.forEach(attack => {
      const key = `${attack.pokemon} - ${attack.attack}`;
      if (!attackStats.has(key)) {
        attackStats.set(key, { count: 0, totalDamage: 0, avgDamage: 0 });
      }
      const stats = attackStats.get(key)!;
      stats.count++;
      stats.totalDamage += attack.damage;
      stats.avgDamage = stats.totalDamage / stats.count;
    });

    const topAttacks = Array.from(attackStats.entries())
      .filter(([, stats]) => stats.count >= 2) // At least 2 uses
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.avgDamage - a.avgDamage)
      .slice(0, 10);

    // Matches per day
    const matchesByDate = new Map<string, number>();
    this.matches.forEach(match => {
      const date = new Date(match.uploadedAt).toISOString().split('T')[0];
      matchesByDate.set(date, (matchesByDate.get(date) || 0) + 1);
    });

    const matchesPerDay = Array.from(matchesByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Turn distribution
    const turnRanges = [
      { min: 1, max: 5, label: "1-5 turnos" },
      { min: 6, max: 10, label: "6-10 turnos" },
      { min: 11, max: 15, label: "11-15 turnos" },
      { min: 16, max: 20, label: "16-20 turnos" },
      { min: 21, max: 30, label: "21-30 turnos" },
      { min: 31, max: Infinity, label: "30+ turnos" }
    ];

    const turnDistribution = turnRanges.map(range => ({
      range: range.label,
      count: this.matches.filter(match => 
        match.turns >= range.min && match.turns <= range.max
      ).length
    }));

    // First player advantage analysis
    const firstPlayerAdvantage = this.analyzeFirstPlayerAdvantage();

    return {
      totalMatches: this.matches.length,
      totalDamageDealt,
      avgDamagePerMatch: Math.round(avgDamagePerMatch),
      totalAttacks,
      avgAttacksPerMatch: Math.round(avgAttacksPerMatch * 10) / 10,
      avgTurns,
      shortestMatch: shortestMatch ? { match: shortestMatch, turns: shortestMatch.turns } : null,
      longestMatch: longestMatch ? { match: longestMatch, turns: longestMatch.turns } : null,
      concededMatches,
      concededPercentage,
      totalTurns,
      avgPrizesPerMatch,
      mostActivePlayers: playerStats.slice(0, 10), // Top 10 most active
      pokemonUsage: pokemonUsageStats,
      typeDominance: typeDominanceStats,
      topAttacks,
      cardUsage: cardUsageStats,
      matchesPerDay,
      turnDistribution,
      firstPlayerAdvantage
    };
  }

  analyzeFirstPlayerAdvantage(): FirstPlayerAdvantage {
    if (this.matches.length === 0) {
      return {
        totalMatches: 0,
        firstPlayerWins: 0,
        firstPlayerWinRate: 0,
        secondPlayerWins: 0,
        secondPlayerWinRate: 0
      };
    }

    let firstPlayerWins = 0;
    let validMatches = 0;

    // Análisis detallado de quién inició cada partida
    this.matches.forEach(match => {
      // Solo contar partidas donde tengamos datos claros del primer jugador
      if (match.firstPlayer && match.firstPlayer.trim()) {
        validMatches++;
        
        // Verificar si el jugador que empezó ganó la partida
        if (match.winner === match.firstPlayer) {
          firstPlayerWins++;
        }
        
        // Debug log para verificar la lógica
        console.log(`Match: ${match.player1} vs ${match.player2} | First: ${match.firstPlayer} | Winner: ${match.winner} | First won: ${match.winner === match.firstPlayer}`);
      } else {
        // Si no tenemos datos del primer jugador, intentar inferir del contexto
        console.log(`Warning: No first player data for match ${match.player1} vs ${match.player2}`);
      }
    });

    const secondPlayerWins = validMatches - firstPlayerWins;
    const firstPlayerWinRate = validMatches > 0 ? (firstPlayerWins / validMatches) * 100 : 0;
    const secondPlayerWinRate = validMatches > 0 ? (secondPlayerWins / validMatches) * 100 : 0;

    console.log(`First Player Advantage Analysis:
    - Total valid matches: ${validMatches}
    - First player wins: ${firstPlayerWins}
    - Second player wins: ${secondPlayerWins}
    - First player win rate: ${firstPlayerWinRate.toFixed(1)}%`);

    return {
      totalMatches: validMatches,
      firstPlayerWins,
      firstPlayerWinRate,
      secondPlayerWins,
      secondPlayerWinRate
    };
  }

  async generateDetailedReport() {
    const gameStats = await this.analyzeGameStats();
    const playerStats = this.analyzePlayerStats();

    return {
      overview: gameStats,
      players: playerStats,
      insights: this.generateInsights(gameStats, playerStats)
    };
  }

  private generateInsights(gameStats: GameStats, playerStats: PlayerStats[]) {
    const insights = [];

    if (gameStats.totalMatches > 0) {
      // Match duration insights
      if (gameStats.avgTurns < 8) {
        insights.push("Las partidas tienden a ser rápidas, indicando matchups agresivos o desbalanceados.");
      } else if (gameStats.avgTurns > 15) {
        insights.push("Las partidas son generalmente largas, sugiriendo estrategias más controladas.");
      }

      // Concession rate insights
      if (gameStats.concededPercentage > 30) {
        insights.push("Alto porcentaje de partidas concedidas, podría indicar desbalance en el meta.");
      } else if (gameStats.concededPercentage < 10) {
        insights.push("Bajo porcentaje de concesiones, las partidas se juegan hasta el final.");
      }

      // Player activity insights
      if (playerStats.length > 0) {
        const topPlayer = playerStats[0];
        if (topPlayer.winRate > 70) {
          insights.push(`${topPlayer.playerName} domina el meta con ${topPlayer.winRate.toFixed(1)}% de victorias.`);
        }

        const activePlayers = playerStats.filter(p => p.totalMatches >= 5);
        if (activePlayers.length > 1) {
          const avgWinRate = activePlayers.reduce((sum, p) => sum + p.winRate, 0) / activePlayers.length;
          insights.push(`El meta está ${avgWinRate > 60 ? 'desbalanceado' : 'equilibrado'} entre jugadores activos.`);
        }
      }

      // Pokemon meta insights
      if (gameStats.pokemonUsageStats.length > 0) {
        const topPokemon = gameStats.pokemonUsageStats[0];
        insights.push(`${topPokemon.name} es el Pokémon más utilizado con ${topPokemon.count} apariciones.`);
        
        const highWinRatePokemon = gameStats.pokemonUsageStats.filter(p => p.winRate > 70 && p.count >= 3);
        if (highWinRatePokemon.length > 0) {
          insights.push(`Pokémon dominantes: ${highWinRatePokemon.map(p => p.name).join(', ')}`);
        }
      }

      // Card usage insights
      if (gameStats.cardUsageStats && gameStats.cardUsageStats.length > 0) {
        const topCard = gameStats.cardUsageStats[0];
        insights.push(`${topCard.name} es la carta más utilizada con ${topCard.count} usos totales.`);
        
        const highWinRateCards = gameStats.cardUsageStats.filter(c => c.winRate > 75 && c.count >= 5);
        if (highWinRateCards.length > 0) {
          insights.push(`Cartas con alta efectividad: ${highWinRateCards.slice(0, 3).map(c => `${c.name} (${c.winRate.toFixed(1)}%)`).join(', ')}`);
        }

        const frequentCards = gameStats.cardUsageStats.filter(c => c.avgPerMatch > 2);
        if (frequentCards.length > 0) {
          insights.push(`Cartas de alto uso: ${frequentCards.slice(0, 2).map(c => `${c.name} (${c.avgPerMatch.toFixed(1)}/partida)`).join(', ')}`);
        }
      }

      // First player advantage insights
      if (gameStats.firstPlayerAdvantage.totalMatches >= 5) {
        const { firstPlayerWinRate } = gameStats.firstPlayerAdvantage;
        if (firstPlayerWinRate > 60) {
          insights.push(`Ventaja significativa para el primer jugador (${firstPlayerWinRate.toFixed(1)}% victorias). Considerar ajustes de balance.`);
        } else if (firstPlayerWinRate < 40) {
          insights.push(`El segundo jugador tiene ventaja (${(100 - firstPlayerWinRate).toFixed(1)}% victorias). El primer turno puede ser una desventaja.`);
        } else if (firstPlayerWinRate >= 45 && firstPlayerWinRate <= 55) {
          insights.push(`Balance perfecto entre primer y segundo jugador (${firstPlayerWinRate.toFixed(1)}% vs ${(100 - firstPlayerWinRate).toFixed(1)}%).`);
        }
      }
    }

    return insights;
  }
}