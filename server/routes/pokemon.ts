import type { Express } from "express";
import { classifyCard, extractPokemon, getPokemonImageUrl, generatePokemonReport } from "../utils/pokemonClassifier";
import { generateCompletePokemonReport } from "../utils/pokemonReportGenerator";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerPokemonRoutes(app: Express) {
  // Endpoint para obtener lista de todos los Pokémon usados en las partidas
  app.get('/api/pokemon/used', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT id, title, player1, player2, full_log
        FROM matches 
        ORDER BY uploaded_at DESC
        LIMIT 20
      `);

      const allPokemon = new Map<string, { count: number; imageUrl: string | null }>();

      for (const row of result.rows) {
        const fullLog = row[4] as string || '';
        
        // Extraer Pokémon del log completo
        const lines = fullLog.split('\n');
        const foundPokemon = new Set<string>();
        
        for (const line of lines) {
          // Buscar múltiples patrones para encontrar Pokémon
          const patterns = [
            /(\w+) played ([^.]+?) to the (Active Spot|Bench)/i,
            /(\w+) evolved ([^.]+?) to ([^.]+?) (?:in|on) the/i,
            /(\w+)'s ([^.]+?) used ([^.]+)/i,
            /([^.]+?) was Knocked Out/i,
            /(\w+) drew ([^.]+?) and played (?:it|them) to the Bench/i
          ];
          
          for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
              let pokemon = '';
              
              // Extraer el nombre del Pokémon según el patrón
              if (pattern.source.includes('played') && !pattern.source.includes('drew')) {
                pokemon = match[2];
              } else if (pattern.source.includes('evolved')) {
                pokemon = match[3]; // El Pokémon evolucionado
              } else if (pattern.source.includes('used')) {
                pokemon = match[2];
              } else if (pattern.source.includes('Knocked Out')) {
                pokemon = match[1].replace(/(\w+)'s /, '');
              } else if (pattern.source.includes('drew')) {
                pokemon = match[2];
              }
              
              pokemon = pokemon.trim();
              
              if (pokemon && classifyCard(pokemon) === 'pokemon') {
                foundPokemon.add(pokemon);
              }
            }
          }
        }
        
        // Agregar Pokémon encontrados al conteo global
        const foundPokemonArray = Array.from(foundPokemon);
        for (const pokemon of foundPokemonArray) {
          if (allPokemon.has(pokemon)) {
            allPokemon.get(pokemon)!.count++;
          } else {
            allPokemon.set(pokemon, { count: 1, imageUrl: null });
          }
        }
      }

      // Obtener imágenes para todos los Pokémon
      const pokemonWithImages = [];
      const pokemonEntries = Array.from(allPokemon.entries());
      for (const [name, data] of pokemonEntries) {
        const imageUrl = await getPokemonImageUrl(name);
        pokemonWithImages.push({
          name,
          count: data.count,
          imageUrl
        });
      }

      // Ordenar por frecuencia de uso
      pokemonWithImages.sort((a, b) => b.count - a.count);

      res.json({
        totalUniquePokemon: pokemonWithImages.length,
        pokemon: pokemonWithImages
      });

    } catch (error) {
      console.error('Error fetching Pokemon data:', error);
      res.status(500).json({ error: 'Failed to fetch Pokemon data' });
    }
  });

  // Endpoint para obtener Pokémon por partida específica
  app.get('/api/pokemon/match/:matchId', async (req, res) => {
    try {
      const { matchId } = req.params;
      
      const result = await db.execute(sql`
        SELECT title, player1, player2, full_log
        FROM matches 
        WHERE id = ${sql.raw(`'${matchId}'`)}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }

      const row = result.rows[0];
      const title = row[0] as string;
      const player1 = row[1] as string;
      const player2 = row[2] as string;
      const fullLog = row[3] as string;

      // Extraer Pokémon del log completo para análisis más detallado
      const logLines = fullLog.split('\n');
      const player1Pokemon = new Set<string>();
      const player2Pokemon = new Set<string>();

      for (const line of logLines) {
        // Buscar patrones como "Player played Pokemon" o "Player's Pokemon used"
        const playPattern = new RegExp(`(${player1}|${player2}) (played|evolved) ([^.]+)`, 'i');
        const usePattern = new RegExp(`(${player1}|${player2})'s ([^\\s]+) used`, 'i');
        
        const playMatch = line.match(playPattern);
        const useMatch = line.match(usePattern);
        
        if (playMatch) {
          const player = playMatch[1];
          const pokemon = playMatch[3].replace(' to the Active Spot', '').replace(' to the Bench', '').trim();
          
          if (classifyCard(pokemon) === 'pokemon') {
            if (player === player1) {
              player1Pokemon.add(pokemon);
            } else {
              player2Pokemon.add(pokemon);
            }
          }
        }
        
        if (useMatch) {
          const player = useMatch[1];
          const pokemon = useMatch[2];
          
          if (classifyCard(pokemon) === 'pokemon') {
            if (player === player1) {
              player1Pokemon.add(pokemon);
            } else {
              player2Pokemon.add(pokemon);
            }
          }
        }
      }

      // Obtener imágenes para todos los Pokémon
      const player1PokemonWithImages = [];
      const player1PokemonArray = Array.from(player1Pokemon);
      for (const pokemon of player1PokemonArray) {
        const imageUrl = await getPokemonImageUrl(pokemon);
        player1PokemonWithImages.push({ name: pokemon, imageUrl });
      }

      const player2PokemonWithImages = [];
      const player2PokemonArray = Array.from(player2Pokemon);
      for (const pokemon of player2PokemonArray) {
        const imageUrl = await getPokemonImageUrl(pokemon);
        player2PokemonWithImages.push({ name: pokemon, imageUrl });
      }

      res.json({
        match: {
          title,
          player1,
          player2
        },
        pokemon: {
          [player1]: player1PokemonWithImages,
          [player2]: player2PokemonWithImages
        }
      });

    } catch (error) {
      console.error('Error fetching match Pokemon data:', error);
      res.status(500).json({ error: 'Failed to fetch match Pokemon data' });
    }
  });

  // Endpoint para clasificar una carta específica
  app.get('/api/pokemon/classify/:cardName', async (req, res) => {
    try {
      const { cardName } = req.params;
      const decodedCardName = decodeURIComponent(cardName);
      
      const classification = classifyCard(decodedCardName);
      let imageUrl = null;
      
      if (classification === 'pokemon') {
        imageUrl = await getPokemonImageUrl(decodedCardName);
      }
      
      res.json({
        cardName: decodedCardName,
        classification,
        imageUrl
      });
      
    } catch (error) {
      console.error('Error classifying card:', error);
      res.status(500).json({ error: 'Failed to classify card' });
    }
  });

  // Endpoint para reporte completo de Pokémon usando datos de la base de datos
  app.get('/api/pokemon/complete-report', async (req, res) => {
    try {
      const report = await generateCompletePokemonReport();
      res.json(report);
    } catch (error) {
      console.error('Error generating complete Pokemon report:', error);
      res.status(500).json({ error: 'Failed to generate complete Pokemon report' });
    }
  });
}