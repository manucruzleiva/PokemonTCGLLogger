import { cardDatabase } from "./cardDatabase";
import type { Match } from "@shared/schema";

export interface EnhancedCardStats {
  name: string;
  count: number;
  winRate: number;
  avgPerMatch: number;
  cardType: string;
  isTrainer: boolean;
  isPokemon: boolean;
  isEnergy: boolean;
  trainerCategory?: string;
  pokemonType?: string;
  effectiveness: "High" | "Medium" | "Low";
  recommendation: string;
}

export interface CardCategoryAnalysis {
  pokemon: {
    total: number;
    byType: Record<string, number>;
    mostEffective: Array<{name: string; winRate: number}>;
  };
  trainers: {
    total: number;
    supporters: number;
    items: number;
    stadiums: number;
    tools: number;
    mostEffective: Array<{name: string; category: string; winRate: number}>;
  };
  energy: {
    total: number;
    basic: number;
    special: number;
    mostUsed: string[];
  };
  metaAnalysis: {
    averageCardsPerDeck: number;
    trainerRatio: number;
    pokemonRatio: number;
    energyRatio: number;
    deckArchetypes: string[];
  };
}

export class EnhancedCardAnalyzer {
  private matches: Match[];

  constructor(matches: Match[]) {
    this.matches = matches;
  }

  async analyzeCardEffectiveness(): Promise<EnhancedCardStats[]> {
    const cardUsage = new Map<string, { 
      count: number; 
      wins: number; 
      total: number; 
      matchCount: number; 
      inWinningDecks: number;
    }>();
    
    this.matches.forEach(match => {
      const allCards = [...(match.player1Cards || []), ...(match.player2Cards || [])];
      const winnerCards = match.winner === match.player1 ? (match.player1Cards || []) : (match.player2Cards || []);
      const loserCards = match.winner === match.player1 ? (match.player2Cards || []) : (match.player1Cards || []);
      
      // Track all cards
      allCards.forEach(cardEntry => {
        let cardName = cardEntry.replace(/\s*\(\d+x\)$/, ''); // Remove quantity
        cardName = cardName.replace(/^\([a-zA-Z0-9_]+\)\s*/, ''); // Remove card codes like (sv7_28)
        const countMatch = cardEntry.match(/\((\d+)x\)$/);
        const count = countMatch ? parseInt(countMatch[1]) : 1;
        
        if (!cardUsage.has(cardName)) {
          cardUsage.set(cardName, { count: 0, wins: 0, total: 0, matchCount: 0, inWinningDecks: 0 });
        }
        const usage = cardUsage.get(cardName)!;
        usage.count += count;
        usage.total += count;
        usage.matchCount++;
      });

      // Track winning cards
      winnerCards.forEach(cardEntry => {
        let cardName = cardEntry.replace(/\s*\(\d+x\)$/, ''); // Remove quantity
        cardName = cardName.replace(/^\([a-zA-Z0-9_]+\)\s*/, ''); // Remove card codes like (sv7_28)
        const countMatch = cardEntry.match(/\((\d+)x\)$/);
        const count = countMatch ? parseInt(countMatch[1]) : 1;
        
        if (cardUsage.has(cardName)) {
          const usage = cardUsage.get(cardName)!;
          usage.wins += count;
          usage.inWinningDecks++;
        }
      });
    });

    // Get card information from Pokemon TCG API
    const cardNames = Array.from(cardUsage.keys());
    const cardInfoMap = await cardDatabase.getMultipleCardInfo(cardNames);
    
    return Array.from(cardUsage.entries())
      .filter(([name, stats]) => stats.matchCount >= 2) // Only cards used in at least 2 matches
      .map(([name, stats]) => {
        const cardInfo = cardInfoMap.get(name);
        const winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
        const deckWinRate = stats.matchCount > 0 ? (stats.inWinningDecks / stats.matchCount) * 100 : 0;
        
        // Calculate effectiveness based on win rate and usage
        let effectiveness: "High" | "Medium" | "Low" = "Low";
        let recommendation = "";
        
        if (winRate >= 60 && stats.count >= 10) {
          effectiveness = "High";
          recommendation = "Carta altamente efectiva - considerar incluir en más mazos";
        } else if (winRate >= 45 && stats.count >= 5) {
          effectiveness = "Medium";
          recommendation = "Carta sólida - útil en ciertos arquetipos";
        } else if (winRate < 30 && stats.count >= 5) {
          effectiveness = "Low";
          recommendation = "Carta poco efectiva - considerar reemplazar";
        } else {
          recommendation = "Datos insuficientes para evaluar efectividad";
        }

        return {
          name,
          count: stats.count,
          winRate: Math.round(winRate * 10) / 10,
          avgPerMatch: Math.round((stats.count / stats.matchCount) * 10) / 10,
          cardType: cardInfo?.supertype || "Unknown",
          isTrainer: cardInfo?.isTrainer || false,
          isPokemon: cardInfo?.isPokemon || false,
          isEnergy: cardInfo?.isEnergy || false,
          trainerCategory: cardInfo?.trainerCategory,
          pokemonType: cardInfo?.pokemonType,
          effectiveness,
          recommendation
        };
      })
      .sort((a, b) => b.winRate - a.winRate);
  }

  async analyzeDeckComposition(): Promise<CardCategoryAnalysis> {
    const cardUsage = new Map<string, number>();
    const cardWins = new Map<string, number>();
    
    // Collect all unique cards
    this.matches.forEach(match => {
      const allCards = [...(match.player1Cards || []), ...(match.player2Cards || [])];
      const winnerCards = match.winner === match.player1 ? (match.player1Cards || []) : (match.player2Cards || []);
      
      allCards.forEach(cardEntry => {
        const cardName = cardEntry.replace(/\s*\(\d+x\)$/, '');
        cardUsage.set(cardName, (cardUsage.get(cardName) || 0) + 1);
      });

      winnerCards.forEach(cardEntry => {
        const cardName = cardEntry.replace(/\s*\(\d+x\)$/, '');
        cardWins.set(cardName, (cardWins.get(cardName) || 0) + 1);
      });
    });

    // Get card information
    const cardNames = Array.from(cardUsage.keys());
    const cardInfoMap = await cardDatabase.getMultipleCardInfo(cardNames);
    const categories = cardDatabase.categorizeCards(cardInfoMap);

    // Calculate type distribution
    const pokemonByType: Record<string, number> = {};
    categories.pokemon.forEach(pokemon => {
      const type = pokemon.type || "Colorless";
      pokemonByType[type] = (pokemonByType[type] || 0) + 1;
    });

    // Find most effective cards by category
    const getMostEffective = (cardList: string[], category?: string) => {
      return cardList
        .map(name => ({
          name,
          category: category || "",
          winRate: cardUsage.has(name) ? ((cardWins.get(name) || 0) / cardUsage.get(name)!) * 100 : 0
        }))
        .filter(card => cardUsage.get(card.name)! >= 3) // At least 3 uses
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 5);
    };

    // Calculate deck composition ratios
    const totalCards = cardNames.length;
    const trainerRatio = totalCards > 0 ? (categories.trainers.supporters.length + 
                                         categories.trainers.items.length + 
                                         categories.trainers.stadiums.length + 
                                         categories.trainers.tools.length) / totalCards * 100 : 0;
    const pokemonRatio = totalCards > 0 ? categories.pokemon.length / totalCards * 100 : 0;
    const energyRatio = totalCards > 0 ? (categories.energy.basic.length + categories.energy.special.length) / totalCards * 100 : 0;

    // Identify deck archetypes based on most used Pokemon types
    const sortedTypes = Object.entries(pokemonByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    return {
      pokemon: {
        total: categories.pokemon.length,
        byType: pokemonByType,
        mostEffective: getMostEffective(categories.pokemon.map(p => p.name))
      },
      trainers: {
        total: categories.trainers.supporters.length + categories.trainers.items.length + 
               categories.trainers.stadiums.length + categories.trainers.tools.length,
        supporters: categories.trainers.supporters.length,
        items: categories.trainers.items.length,
        stadiums: categories.trainers.stadiums.length,
        tools: categories.trainers.tools.length,
        mostEffective: [
          ...getMostEffective(categories.trainers.supporters, "Supporter"),
          ...getMostEffective(categories.trainers.items, "Item"),
          ...getMostEffective(categories.trainers.stadiums, "Stadium"),
          ...getMostEffective(categories.trainers.tools, "Tool")
        ].sort((a, b) => b.winRate - a.winRate).slice(0, 8)
      },
      energy: {
        total: categories.energy.basic.length + categories.energy.special.length,
        basic: categories.energy.basic.length,
        special: categories.energy.special.length,
        mostUsed: [...categories.energy.basic, ...categories.energy.special].slice(0, 5)
      },
      metaAnalysis: {
        averageCardsPerDeck: this.calculateAverageDeckSize(),
        trainerRatio: Math.round(trainerRatio * 10) / 10,
        pokemonRatio: Math.round(pokemonRatio * 10) / 10,
        energyRatio: Math.round(energyRatio * 10) / 10,
        deckArchetypes: sortedTypes.length > 0 ? [`${sortedTypes[0]} Focus`, `${sortedTypes.join("/")} Mix`] : ["Mixed"]
      }
    };
  }

  private calculateAverageDeckSize(): number {
    let totalCardCount = 0;
    let deckCount = 0;

    this.matches.forEach(match => {
      // Count player 1 deck
      if (match.player1Cards && match.player1Cards.length > 0) {
        const deckSize = match.player1Cards.reduce((sum, cardEntry) => {
          const countMatch = cardEntry.match(/\((\d+)x\)$/);
          const count = countMatch ? parseInt(countMatch[1]) : 1;
          return sum + count;
        }, 0);
        totalCardCount += deckSize;
        deckCount++;
      }

      // Count player 2 deck
      if (match.player2Cards && match.player2Cards.length > 0) {
        const deckSize = match.player2Cards.reduce((sum, cardEntry) => {
          const countMatch = cardEntry.match(/\((\d+)x\)$/);
          const count = countMatch ? parseInt(countMatch[1]) : 1;
          return sum + count;
        }, 0);
        totalCardCount += deckSize;
        deckCount++;
      }
    });

    return deckCount > 0 ? Math.round((totalCardCount / deckCount) * 10) / 10 : 60; // Default to 60 if no data
  }

  generateCardRecommendations(cardStats: EnhancedCardStats[]): string[] {
    const recommendations: string[] = [];

    // Find overpowered cards
    const overpowered = cardStats.filter(card => 
      card.winRate > 70 && card.count >= 10 && card.effectiveness === "High"
    );

    if (overpowered.length > 0) {
      recommendations.push(
        `Cartas dominantes en el meta: ${overpowered.slice(0, 3).map(c => c.name).join(", ")} - ` +
        `Considera incluir estas cartas altamente efectivas en tus mazos.`
      );
    }

    // Find underperforming popular cards
    const underperforming = cardStats.filter(card => 
      card.winRate < 40 && card.count >= 8 && card.effectiveness === "Low"
    );

    if (underperforming.length > 0) {
      recommendations.push(
        `Cartas populares pero poco efectivas: ${underperforming.slice(0, 2).map(c => c.name).join(", ")} - ` +
        `Considera reemplazarlas por alternativas más efectivas.`
      );
    }

    // Trainer card analysis
    const effectiveTrainers = cardStats.filter(card => 
      card.isTrainer && card.winRate > 55 && card.count >= 5
    );

    if (effectiveTrainers.length > 0) {
      recommendations.push(
        `Cartas de entrenador efectivas: ${effectiveTrainers.slice(0, 3).map(c => c.name).join(", ")} - ` +
        `Estas cartas de apoyo muestran alto impacto en la victoria.`
      );
    }

    return recommendations;
  }
}