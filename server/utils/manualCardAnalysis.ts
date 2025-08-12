import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface DetailedCardAnalysis {
  matchTitle: string;
  player1: {
    name: string;
    pokemonCards: string[];
    trainerCards: string[];
    energyCards: string[];
    abilities: string[];
    attacks: string[];
  };
  player2: {
    name: string;
    pokemonCards: string[];
    trainerCards: string[];
    energyCards: string[];
    abilities: string[];
    attacks: string[];
  };
}

// Listas más completas de cartas conocidas
const POKEMON_CARDS = [
  'Munkidori', 'Gimmighoul', 'Gholdengo ex', 'Genesect ex', 'Fezandipiti ex',
  'Ralts', 'Kirlia', 'Gardevoir ex', 'Frillish', 'Scyther', 'Scizor',
  'Mew ex', 'Scream Tail', 'Lillie\'s Clefairy ex', 'Roaring Moon ex'
];

const TRAINER_CARDS = [
  'Nest Ball', 'Ultra Ball', 'Professor\'s Research', 'Artazon', 'Super Rod',
  'Counter Catcher', 'Technical Machine: Evolution', 'Technical Machine: Turbo Energize',
  'Earthen Vessel', 'Ciphermaniac\'s Codebreaking', 'Professor Turo\'s Scenario',
  'Buddy-Buddy Poffin', 'Boss\'s Orders', 'Energy Search Pro', 'Superior Energy Retrieval',
  'Arven', 'Secret Box', 'Bravery Charm', 'Air Balloon', 'Night Stretcher',
  'Levincia', 'Iono', 'Occa Berry', 'Redeemable Ticket', 'Tool Scrapper',
  'Picnic Basket'
];

const ENERGY_CARDS = [
  'Basic Grass Energy', 'Basic Fire Energy', 'Basic Water Energy',
  'Basic Lightning Energy', 'Basic Psychic Energy', 'Basic Fighting Energy',
  'Basic Darkness Energy', 'Basic Metal Energy'
];

const ABILITIES = [
  'Metallic Signal', 'Coin Bonus', 'Flip the Script', 'Minor Errand-Running',
  'Psychic Embrace', 'Evolution', 'Restart', 'Adrena-Brain'
];

const ATTACKS = [
  'Make It Rain', 'Roaring Scream', 'Miracle Force', 'Buddy Blast',
  'Punishing Scissors', 'Shadow Bullet', 'Freezing Shroud'
];

function parseLogForCards(logText: string, playerName: string): {
  pokemonCards: string[];
  trainerCards: string[];
  energyCards: string[];
  abilities: string[];
  attacks: string[];
} {
  const lines = logText.split('\n');
  const pokemonCards = new Set<string>();
  const trainerCards = new Set<string>();
  const energyCards = new Set<string>();
  const abilities = new Set<string>();
  const attacks = new Set<string>();

  for (const line of lines) {
    if (line.trim().startsWith(playerName)) {
      // Buscar cartas jugadas
      if (line.includes(' played ')) {
        for (const pokemon of POKEMON_CARDS) {
          if (line.includes(pokemon)) {
            pokemonCards.add(pokemon);
          }
        }
        for (const trainer of TRAINER_CARDS) {
          if (line.includes(trainer)) {
            trainerCards.add(trainer);
          }
        }
        for (const energy of ENERGY_CARDS) {
          if (line.includes(energy)) {
            energyCards.add(energy);
          }
        }
      }

      // Buscar habilidades usadas
      if (line.includes(' used ')) {
        for (const ability of ABILITIES) {
          if (line.includes(ability)) {
            abilities.add(ability);
          }
        }
        for (const attack of ATTACKS) {
          if (line.includes(attack)) {
            attacks.add(attack);
          }
        }
      }

      // Buscar energías attachadas
      if (line.includes(' attached ')) {
        for (const energy of ENERGY_CARDS) {
          if (line.includes(energy)) {
            energyCards.add(energy);
          }
        }
      }
    }
  }

  return {
    pokemonCards: Array.from(pokemonCards),
    trainerCards: Array.from(trainerCards),
    energyCards: Array.from(energyCards),
    abilities: Array.from(abilities),
    attacks: Array.from(attacks)
  };
}

export async function generateDetailedCardAnalysis(): Promise<DetailedCardAnalysis[]> {
  try {
    const result = await db.execute(sql`
      SELECT id, title, player1, player2, full_log 
      FROM matches 
      ORDER BY uploaded_at DESC
      LIMIT 10
    `);

    const analyses: DetailedCardAnalysis[] = [];

    for (const row of result.rows) {
      const id = row[0] as string;
      const title = row[1] as string;
      const player1Name = row[2] as string;
      const player2Name = row[3] as string;
      const fullLog = row[4] as string;

      if (fullLog && fullLog.trim()) {
        const player1Cards = parseLogForCards(fullLog, player1Name);
        const player2Cards = parseLogForCards(fullLog, player2Name);

        analyses.push({
          matchTitle: title,
          player1: {
            name: player1Name,
            ...player1Cards
          },
          player2: {
            name: player2Name,
            ...player2Cards
          }
        });
      }
    }

    return analyses;
  } catch (error) {
    console.error('Error in detailed card analysis:', error);
    return [];
  }
}

export function generateCardReport(analyses: DetailedCardAnalysis[]): string {
  let report = `# ANÁLISIS DETALLADO DE CARTAS UTILIZADAS POR JUGADOR\n\n`;
  report += `Análisis basado en ${analyses.length} partidas recientes\n\n`;

  for (const analysis of analyses) {
    report += `## ${analysis.matchTitle}\n\n`;

    // Player 1
    report += `### ${analysis.player1.name}\n\n`;
    
    if (analysis.player1.pokemonCards.length > 0) {
      report += `**Pokémon utilizados (${analysis.player1.pokemonCards.length}):**\n`;
      analysis.player1.pokemonCards.forEach(card => {
        report += `- ${card}\n`;
      });
      report += '\n';
    }

    if (analysis.player1.trainerCards.length > 0) {
      report += `**Cartas de Entrenador utilizadas (${analysis.player1.trainerCards.length}):**\n`;
      analysis.player1.trainerCards.forEach(card => {
        report += `- ${card}\n`;
      });
      report += '\n';
    }

    if (analysis.player1.energyCards.length > 0) {
      report += `**Energías utilizadas (${analysis.player1.energyCards.length}):**\n`;
      analysis.player1.energyCards.forEach(card => {
        report += `- ${card}\n`;
      });
      report += '\n';
    }

    if (analysis.player1.abilities.length > 0) {
      report += `**Habilidades utilizadas (${analysis.player1.abilities.length}):**\n`;
      analysis.player1.abilities.forEach(ability => {
        report += `- ${ability}\n`;
      });
      report += '\n';
    }

    if (analysis.player1.attacks.length > 0) {
      report += `**Ataques utilizados (${analysis.player1.attacks.length}):**\n`;
      analysis.player1.attacks.forEach(attack => {
        report += `- ${attack}\n`;
      });
      report += '\n';
    }

    // Player 2
    report += `### ${analysis.player2.name}\n\n`;
    
    if (analysis.player2.pokemonCards.length > 0) {
      report += `**Pokémon utilizados (${analysis.player2.pokemonCards.length}):**\n`;
      analysis.player2.pokemonCards.forEach(card => {
        report += `- ${card}\n`;
      });
      report += '\n';
    }

    if (analysis.player2.trainerCards.length > 0) {
      report += `**Cartas de Entrenador utilizadas (${analysis.player2.trainerCards.length}):**\n`;
      analysis.player2.trainerCards.forEach(card => {
        report += `- ${card}\n`;
      });
      report += '\n';
    }

    if (analysis.player2.energyCards.length > 0) {
      report += `**Energías utilizadas (${analysis.player2.energyCards.length}):**\n`;
      analysis.player2.energyCards.forEach(card => {
        report += `- ${card}\n`;
      });
      report += '\n';
    }

    if (analysis.player2.abilities.length > 0) {
      report += `**Habilidades utilizadas (${analysis.player2.abilities.length}):**\n`;
      analysis.player2.abilities.forEach(ability => {
        report += `- ${ability}\n`;
      });
      report += '\n';
    }

    if (analysis.player2.attacks.length > 0) {
      report += `**Ataques utilizados (${analysis.player2.attacks.length}):**\n`;
      analysis.player2.attacks.forEach(attack => {
        report += `- ${attack}\n`;
      });
      report += '\n';
    }

    report += `---\n\n`;
  }

  return report;
}

// Función para obtener estadísticas globales
export function generateGlobalCardStats(analyses: DetailedCardAnalysis[]): string {
  const pokemonUsage = new Map<string, number>();
  const trainerUsage = new Map<string, number>();
  const energyUsage = new Map<string, number>();
  const abilityUsage = new Map<string, number>();
  const attackUsage = new Map<string, number>();

  for (const analysis of analyses) {
    // Contar para ambos jugadores
    [analysis.player1, analysis.player2].forEach(player => {
      player.pokemonCards.forEach(card => {
        pokemonUsage.set(card, (pokemonUsage.get(card) || 0) + 1);
      });
      player.trainerCards.forEach(card => {
        trainerUsage.set(card, (trainerUsage.get(card) || 0) + 1);
      });
      player.energyCards.forEach(card => {
        energyUsage.set(card, (energyUsage.get(card) || 0) + 1);
      });
      player.abilities.forEach(ability => {
        abilityUsage.set(ability, (abilityUsage.get(ability) || 0) + 1);
      });
      player.attacks.forEach(attack => {
        attackUsage.set(attack, (attackUsage.get(attack) || 0) + 1);
      });
    });
  }

  let report = `# ESTADÍSTICAS GLOBALES DE USO DE CARTAS\n\n`;
  report += `Basado en ${analyses.length} partidas analizadas\n\n`;

  // Pokémon más utilizados
  const topPokemon = Array.from(pokemonUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (topPokemon.length > 0) {
    report += `## Pokémon más utilizados\n\n`;
    topPokemon.forEach(([card, count]) => {
      report += `- ${card}: ${count} veces\n`;
    });
    report += '\n';
  }

  // Entrenadores más utilizados
  const topTrainers = Array.from(trainerUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (topTrainers.length > 0) {
    report += `## Cartas de Entrenador más utilizadas\n\n`;
    topTrainers.forEach(([card, count]) => {
      report += `- ${card}: ${count} veces\n`;
    });
    report += '\n';
  }

  // Habilidades más utilizadas
  const topAbilities = Array.from(abilityUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (topAbilities.length > 0) {
    report += `## Habilidades más utilizadas\n\n`;
    topAbilities.forEach(([ability, count]) => {
      report += `- ${ability}: ${count} veces\n`;
    });
    report += '\n';
  }

  return report;
}