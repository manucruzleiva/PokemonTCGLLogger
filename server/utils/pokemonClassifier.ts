// Clasificador preciso de cartas Pokemon vs Trainer vs Energy

// Lista completa de Pokémon conocidos (sin habilidades ni ataques)
export const KNOWN_POKEMON = new Set([
  // Metal/Colorless Pokemon
  'Munkidori', 'Gimmighoul', 'Gholdengo ex', 'Genesect ex', 'Genesect', 'Fezandipiti ex',
  'Scyther', 'Scizor',
  
  // Psychic Pokemon
  'Ralts', 'Kirlia', 'Gardevoir ex', 'Frillish', 'Mew ex', 'Scream Tail',
  
  // Water Pokemon  
  'Lapras ex', 'Hydreigon ex', 'Deino',
  
  // Fire Pokemon
  'Charcadet', 'Armarouge', 'Ethan\'s Cyndaquil', 'Ethan\'s Quilava', 'Victini',
  
  // Electric Pokemon
  'Fan Rotom', 'Tynamo', 'Eelektrik', 'Squawkabilly ex', 'Miraidon ex', 
  'Iron Hands ex', 'Zeraora', 'Iron Thorns ex',
  
  // Grass Pokemon
  'Wellspring Mask Ogerpon ex', 'Shaymin',
  
  // Normal/Flying Pokemon
  'Hoothoot', 'Pidgey',
  
  // Dark Pokemon
  'Snorunt', 'Marnie\'s Impidimp', 'Marnie\'s Morgrem', 'Marnie\'s Grimmsnarl ex',
  
  // Fighting Pokemon
  'Okidogi ex',
  
  // Psychic/Dragon Pokemon
  'Latias ex',
  
  // Special/Promotional Pokemon
  'Lillie\'s Clefairy ex', 'Roaring Moon ex'
]);

// Habilidades de Pokémon (NO son cartas físicas)
export const POKEMON_ABILITIES = new Set([
  'Metallic Signal', 'Coin Bonus', 'Psychic Embrace', 'Flip the Script',
  'Adrena-Brain', 'Restart', 'Minor Errand-Running', 'Squawk and Seize',
  'Tandem Unit', 'Evolution', 'Punk Up', 'Filch', 'Fan Call', 'Golden Flame'
]);

// Ataques de Pokémon (NO son cartas físicas)
export const POKEMON_ATTACKS = new Set([
  'Make It Rain', 'Freezing Shroud', 'Shadow Bullet', 'Punishing Scissors',
  'Roaring Scream', 'Miracle Force', 'Crashing Headbutt', 'Torrential Pump',
  'Fire Off', 'Sob', 'Flame Cannon', 'Larimar Rain', 'Combustion'
]);

// Cartas de Entrenador (objetos, supporters, stadiums)
export const TRAINER_CARDS = new Set([
  // Items/Tools
  'Nest Ball', 'Ultra Ball', 'Air Balloon', 'Earthen Vessel', 'Secret Box',
  'Bravery Charm', 'Superior Energy Retrieval', 'Energy Search Pro', 'Counter Catcher',
  'Tool Scrapper', 'Night Stretcher', 'Super Rod', 'Redeemable Ticket',
  'Electric Generator', 'Sparkling Crystal', 'Sacred Ash', 'Occa Berry',
  
  // Technical Machines
  'Technical Machine: Evolution', 'Technical Machine: Turbo Energize',
  
  // Supporters
  'Professor\'s Research', 'Professor Turo\'s Scenario', 'Boss\'s Orders',
  'Arven', 'Iono', 'Buddy-Buddy Poffin', 'Carmine', 'Ciphermaniac\'s Codebreaking',
  'Ethan\'s Adventure', 'Jewel Seeker',
  
  // Stadiums
  'Artazon', 'Levincia', 'Spikemuth Gym'
]);

// Energías básicas y especiales
export const ENERGY_CARDS = new Set([
  'Basic Grass Energy', 'Basic Fire Energy', 'Basic Water Energy',
  'Basic Lightning Energy', 'Basic Psychic Energy', 'Basic Fighting Energy',
  'Basic Darkness Energy', 'Basic Metal Energy', 'Prism Energy'
]);

// Función para clasificar una carta correctamente
export function classifyCard(cardName: string): 'pokemon' | 'trainer' | 'energy' | 'ability' | 'attack' | 'unknown' {
  // Filtrar ataques con patrón específico (ej: "Make It Rain on Player's Pokemon for X damage")
  if (cardName.includes(' on ') && cardName.includes(' for ') && cardName.includes(' damage')) {
    return 'attack';
  }
  
  if (KNOWN_POKEMON.has(cardName)) {
    return 'pokemon';
  }
  
  if (POKEMON_ABILITIES.has(cardName)) {
    return 'ability';
  }
  
  if (POKEMON_ATTACKS.has(cardName)) {
    return 'attack';
  }
  
  if (TRAINER_CARDS.has(cardName)) {
    return 'trainer';
  }
  
  if (ENERGY_CARDS.has(cardName)) {
    return 'energy';
  }
  
  return 'unknown';
}

// Función para extraer solo Pokémon de una lista de cartas
export function extractPokemon(cardNames: string[]): string[] {
  return cardNames.filter(name => classifyCard(name) === 'pokemon');
}

// Función para obtener URL de imagen de Pokémon usando PokeAPI
export async function getPokemonImageUrl(pokemonName: string): Promise<string | null> {
  try {
    // Limpiar el nombre del Pokémon (remover "ex", "Marnie's", etc.)
    const cleanName = pokemonName
      .replace(/ ex$/i, '')
      .replace(/^.*'s /i, '')
      .replace(/^Ethan's /i, '')
      .replace(/^Lillie's /i, '')
      .replace(/^Marnie's /i, '')
      .replace(/ Mask /i, ' ')
      .toLowerCase()
      .trim();
    
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.sprites?.other?.['official-artwork']?.front_default || 
             data.sprites?.front_default || 
             null;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching image for ${pokemonName}:`, error);
    return null;
  }
}

// Función para generar reporte de Pokémon utilizados por jugador
export interface PlayerPokemonReport {
  player: string;
  pokemon: Array<{
    name: string;
    imageUrl: string | null;
    timesUsed: number;
  }>;
}

export async function generatePokemonReport(cardUsageData: any): Promise<PlayerPokemonReport[]> {
  const reports: PlayerPokemonReport[] = [];
  
  for (const playerData of cardUsageData) {
    const pokemonCards = extractPokemon(playerData.cards || []);
    const pokemonWithImages = [];
    
    for (const pokemon of pokemonCards) {
      const imageUrl = await getPokemonImageUrl(pokemon);
      pokemonWithImages.push({
        name: pokemon,
        imageUrl,
        timesUsed: 1 // TODO: implementar conteo real de usos
      });
    }
    
    reports.push({
      player: playerData.player,
      pokemon: pokemonWithImages
    });
  }
  
  return reports;
}