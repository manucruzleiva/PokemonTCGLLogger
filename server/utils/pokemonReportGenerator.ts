import { db } from '../db';
import { sql } from 'drizzle-orm';
import { classifyCard, getPokemonImageUrl } from './pokemonClassifier';

// Generar reporte completo de Pokémon utilizados por jugador
export async function generateCompletePokemonReport() {
  try {
    const result = await db.execute(sql`
      SELECT id, title, player1, player2, full_log, player1_pokemon, player2_pokemon
      FROM matches 
      ORDER BY uploaded_at DESC
      LIMIT 20
    `);

    const report = {
      totalMatches: result.rows.length,
      allPokemonUsed: new Map<string, { count: number; imageUrl: string | null; users: Set<string> }>(),
      playerReports: new Map<string, { pokemon: Set<string>; matches: number }>()
    };

    for (const row of result.rows) {
      const title = row[1] as string;
      const player1 = row[2] as string;
      const player2 = row[3] as string;
      const fullLog = row[4] as string || '';
      const player1Pokemon = (row[5] as string[]) || [];
      const player2Pokemon = (row[6] as string[]) || [];

      // Usar datos existentes de la base de datos
      const allMatchPokemon = [...player1Pokemon, ...player2Pokemon];
      
      // Inicializar reportes de jugadores
      if (!report.playerReports.has(player1)) {
        report.playerReports.set(player1, { pokemon: new Set(), matches: 0 });
      }
      if (!report.playerReports.has(player2)) {
        report.playerReports.set(player2, { pokemon: new Set(), matches: 0 });
      }
      
      report.playerReports.get(player1)!.matches++;
      report.playerReports.get(player2)!.matches++;

      // Agregar Pokémon de la base de datos
      for (const pokemon of player1Pokemon) {
        if (classifyCard(pokemon) === 'pokemon') {
          report.playerReports.get(player1)!.pokemon.add(pokemon);
          
          if (report.allPokemonUsed.has(pokemon)) {
            report.allPokemonUsed.get(pokemon)!.count++;
            report.allPokemonUsed.get(pokemon)!.users.add(player1);
          } else {
            report.allPokemonUsed.set(pokemon, { 
              count: 1, 
              imageUrl: null, 
              users: new Set([player1]) 
            });
          }
        }
      }

      for (const pokemon of player2Pokemon) {
        if (classifyCard(pokemon) === 'pokemon') {
          report.playerReports.get(player2)!.pokemon.add(pokemon);
          
          if (report.allPokemonUsed.has(pokemon)) {
            report.allPokemonUsed.get(pokemon)!.count++;
            report.allPokemonUsed.get(pokemon)!.users.add(player2);
          } else {
            report.allPokemonUsed.set(pokemon, { 
              count: 1, 
              imageUrl: null, 
              users: new Set([player2]) 
            });
          }
        }
      }

      // Buscar en el log completo solo si hay log disponible
      if (fullLog) {
        const logLines = fullLog.split('\n');
        for (const line of logLines) {
          // Patrones simples para encontrar Pokémon
          const patterns = [
            new RegExp(`(${player1}|${player2}) played ([^.]+?) to the`, 'i'),
            new RegExp(`(${player1}|${player2})'s ([^\\s]+) used`, 'i')
          ];
          
          for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
              const player = match[1];
              const pokemon = match[2]?.trim();
              
              if (pokemon && classifyCard(pokemon) === 'pokemon') {
                if (report.playerReports.has(player)) {
                  report.playerReports.get(player)!.pokemon.add(pokemon);
                }
                
                if (report.allPokemonUsed.has(pokemon)) {
                  report.allPokemonUsed.get(pokemon)!.count++;
                  report.allPokemonUsed.get(pokemon)!.users.add(player);
                } else {
                  report.allPokemonUsed.set(pokemon, { 
                    count: 1, 
                    imageUrl: null, 
                    users: new Set([player]) 
                  });
                }
              }
            }
          }
        }
      }
    }

    // Obtener imágenes para todos los Pokémon
    const pokemonWithImages = [];
    const allPokemonEntries = Array.from(report.allPokemonUsed.entries());
    
    for (const [name, data] of allPokemonEntries) {
      const imageUrl = await getPokemonImageUrl(name);
      pokemonWithImages.push({
        name,
        count: data.count,
        imageUrl,
        usedBy: Array.from(data.users)
      });
    }

    // Ordenar por frecuencia de uso
    pokemonWithImages.sort((a, b) => b.count - a.count);

    // Generar reporte por jugador
    const playerStats = [];
    const playerEntries = Array.from(report.playerReports.entries());
    
    for (const [player, data] of playerEntries) {
      const pokemonList = Array.from(data.pokemon);
      const pokemonWithImagesForPlayer = [];
      
      for (const pokemon of pokemonList) {
        const imageUrl = await getPokemonImageUrl(pokemon);
        pokemonWithImagesForPlayer.push({ name: pokemon, imageUrl });
      }
      
      playerStats.push({
        player,
        totalMatches: data.matches,
        uniquePokemon: pokemonList.length,
        pokemon: pokemonWithImagesForPlayer
      });
    }

    return {
      summary: {
        totalMatches: report.totalMatches,
        totalUniquePokemon: pokemonWithImages.length,
        totalPlayers: playerStats.length
      },
      allPokemon: pokemonWithImages,
      playerStats: playerStats.sort((a, b) => b.uniquePokemon - a.uniquePokemon)
    };

  } catch (error) {
    console.error('Error generating complete Pokemon report:', error);
    throw error;
  }
}