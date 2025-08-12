import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface CardUsageAnalysis {
  player: string;
  actualCards: Array<{
    name: string;
    count: number;
    type: 'Pokemon' | 'Trainer' | 'Energy' | 'Ability' | 'Attack';
  }>;
  pokemonUsed: string[];
  abilitiesUsed: string[];
  attacksUsed: string[];
}

export interface MatchCardAnalysis {
  matchId: string;
  matchTitle: string;
  players: {
    player1: CardUsageAnalysis;
    player2: CardUsageAnalysis;
  };
}

// Lista de habilidades conocidas de Pokemon que NO son cartas
const KNOWN_ABILITIES = [
  'Metallic Signal', 'Coin Bonus', 'Make It Rain', 'Flip the Script',
  'Minor Errand-Running', 'Psychic Embrace', 'Roaring Scream', 'Miracle Force',
  'Adrena-Brain', 'Evolution', 'Restart', 'Buddy Blast', 'Punishing Scissors',
  'Freezing Shroud', 'Shadow Bullet'
];

// Lista de ataques conocidos que NO son cartas
const KNOWN_ATTACKS = [
  'Make It Rain on', 'Roaring Scream on', 'Miracle Force on', 'Buddy Blast on',
  'Punishing Scissors on', 'Shadow Bullet on', 'Freezing Shroud on'
];

// Lista de energías básicas
const BASIC_ENERGIES = [
  'Basic Grass Energy', 'Basic Fire Energy', 'Basic Water Energy',
  'Basic Lightning Energy', 'Basic Psychic Energy', 'Basic Fighting Energy',
  'Basic Darkness Energy', 'Basic Metal Energy', 'Basic Fairy Energy'
];

// Lista de Pokémon conocidos
const KNOWN_POKEMON = [
  'Munkidori', 'Gimmighoul', 'Gholdengo ex', 'Genesect ex', 'Fezandipiti ex',
  'Ralts', 'Kirlia', 'Gardevoir ex', 'Frillish', 'Scyther', 'Scizor',
  'Mew ex', 'Scream Tail', 'Lillie\'s Clefairy ex', 'Roaring Moon ex'
];

function isAbility(cardName: string): boolean {
  return KNOWN_ABILITIES.some(ability => cardName.includes(ability));
}

function isAttack(cardName: string): boolean {
  return KNOWN_ATTACKS.some(attack => cardName.includes(attack));
}

function isPokemon(cardName: string): boolean {
  return KNOWN_POKEMON.some(pokemon => cardName.includes(pokemon));
}

function isEnergy(cardName: string): boolean {
  return BASIC_ENERGIES.includes(cardName) || cardName.includes('Energy');
}

function cleanCardName(cardName: string): string {
  // Limpiar nombres de cartas de ataques específicos
  const attackPatterns = [
    / on .+? for \d+ damage$/,
    / from .+?$/,
    / to .+?$/
  ];
  
  let cleaned = cardName;
  for (const pattern of attackPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  return cleaned.trim();
}

function categorizeCard(cardName: string): 'Pokemon' | 'Trainer' | 'Energy' | 'Ability' | 'Attack' {
  const cleanName = cleanCardName(cardName);
  
  if (isAttack(cardName)) return 'Attack';
  if (isAbility(cleanName)) return 'Ability';
  if (isPokemon(cleanName)) return 'Pokemon';
  if (isEnergy(cleanName)) return 'Energy';
  
  return 'Trainer'; // Default para cartas de entrenador
}

export function analyzePlayerCards(playerName: string, cardsString: string | null): CardUsageAnalysis {
  if (!cardsString) {
    return {
      player: playerName,
      actualCards: [],
      pokemonUsed: [],
      abilitiesUsed: [],
      attacksUsed: []
    };
  }
  
  const cardEntries = cardsString.replace(/[{}]/g, '').split(',');
  const actualCards: Array<{name: string; count: number; type: 'Pokemon' | 'Trainer' | 'Energy' | 'Ability' | 'Attack'}> = [];
  const pokemonUsed: string[] = [];
  const abilitiesUsed: string[] = [];
  const attacksUsed: string[] = [];
  
  for (const entry of cardEntries) {
    const trimmed = entry.trim().replace(/"/g, '');
    const match = trimmed.match(/(.+?) \((\d+)x\)$/);
    
    if (match) {
      const cardName = match[1];
      const count = parseInt(match[2]);
      const category = categorizeCard(cardName);
      
      switch (category) {
        case 'Pokemon':
          if (!pokemonUsed.includes(cleanCardName(cardName))) {
            pokemonUsed.push(cleanCardName(cardName));
          }
          break;
        case 'Ability':
          if (!abilitiesUsed.includes(cleanCardName(cardName))) {
            abilitiesUsed.push(cleanCardName(cardName));
          }
          break;
        case 'Attack':
          if (!attacksUsed.includes(cardName)) {
            attacksUsed.push(cardName);
          }
          break;
        case 'Trainer':
        case 'Energy':
          actualCards.push({
            name: cleanCardName(cardName),
            count,
            type: category
          });
          break;
      }
      
      // Solo agregar a actualCards si es una carta física real
      if (category === 'Pokemon' || category === 'Trainer' || category === 'Energy') {
        actualCards.push({
          name: cleanCardName(cardName),
          count,
          type: category
        });
      }
    }
  }
  
  return {
    player: playerName,
    actualCards,
    pokemonUsed,
    abilitiesUsed,
    attacksUsed
  };
}

export async function analyzeAllMatches(): Promise<MatchCardAnalysis[]> {
  try {
    const result = await db.execute(sql`
      SELECT id, title, player1, player2, player1_cards, player2_cards 
      FROM matches 
      ORDER BY uploaded_at DESC
    `);
    
    const matches: MatchCardAnalysis[] = [];
    
    for (const row of result.rows) {
      const matchId = row[0] as string;
      const title = row[1] as string;
      const player1 = row[2] as string;
      const player2 = row[3] as string;
      const player1Cards = row[4] as string;
      const player2Cards = row[5] as string;
      
      const player1Analysis = analyzePlayerCards(player1, player1Cards);
      const player2Analysis = analyzePlayerCards(player2, player2Cards);
      
      matches.push({
        matchId,
        matchTitle: title,
        players: {
          player1: player1Analysis,
          player2: player2Analysis
        }
      });
    }
    
    return matches;
  } catch (error) {
    console.error('Error analyzing matches:', error);
    return [];
  }
}

export function generateCardUsageReport(analyses: MatchCardAnalysis[]): string {
  let report = "# ANÁLISIS DE CARTAS UTILIZADAS POR JUGADOR\n\n";
  
  for (const match of analyses) {
    report += `## ${match.matchTitle}\n\n`;
    
    // Player 1
    const p1 = match.players.player1;
    report += `### ${p1.player}\n`;
    report += `**Cartas físicas utilizadas:**\n`;
    p1.actualCards.forEach(card => {
      report += `- ${card.name} (${card.count}x) - ${card.type}\n`;
    });
    
    report += `\n**Pokémon usados:**\n`;
    p1.pokemonUsed.forEach(pokemon => {
      report += `- ${pokemon}\n`;
    });
    
    report += `\n**Habilidades usadas:**\n`;
    p1.abilitiesUsed.forEach(ability => {
      report += `- ${ability}\n`;
    });
    
    if (p1.attacksUsed.length > 0) {
      report += `\n**Ataques usados:**\n`;
      p1.attacksUsed.forEach(attack => {
        report += `- ${attack}\n`;
      });
    }
    
    // Player 2
    const p2 = match.players.player2;
    report += `\n### ${p2.player}\n`;
    report += `**Cartas físicas utilizadas:**\n`;
    p2.actualCards.forEach(card => {
      report += `- ${card.name} (${card.count}x) - ${card.type}\n`;
    });
    
    report += `\n**Pokémon usados:**\n`;
    p2.pokemonUsed.forEach(pokemon => {
      report += `- ${pokemon}\n`;
    });
    
    report += `\n**Habilidades usadas:**\n`;
    p2.abilitiesUsed.forEach(ability => {
      report += `- ${ability}\n`;
    });
    
    if (p2.attacksUsed.length > 0) {
      report += `\n**Ataques usados:**\n`;
      p2.attacksUsed.forEach(attack => {
        report += `- ${attack}\n`;
      });
    }
    
    report += `\n---\n\n`;
  }
  
  return report;
}