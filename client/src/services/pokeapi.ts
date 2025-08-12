// PokeAPI service for fetching Pokemon data and images
export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
      home: {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

// Cache to avoid repeated API calls
const pokemonCache = new Map<string, Pokemon>();

export async function fetchPokemon(name: string): Promise<Pokemon | null> {
  try {
    // Clean and normalize the Pokemon name
    const cleanName = normalizePokemonName(name);
    
    // Check cache first
    if (pokemonCache.has(cleanName)) {
      return pokemonCache.get(cleanName)!;
    }

    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${cleanName}`);
    
    if (!response.ok) {
      console.warn(`Pokemon not found in PokeAPI: ${cleanName}`);
      return null;
    }

    const pokemon: Pokemon = await response.json();
    
    // Cache the result
    pokemonCache.set(cleanName, pokemon);
    
    return pokemon;
  } catch (error) {
    console.error(`Error fetching Pokemon ${name}:`, error);
    return null;
  }
}

export function normalizePokemonName(name: string): string {
  // Remove common TCG suffixes and prefixes
  let cleanName = name
    .toLowerCase()
    .replace(/\s*ex$/i, '') // Remove "ex" suffix
    .replace(/\s*vmax$/i, '') // Remove "vmax" suffix
    .replace(/\s*v$/i, '') // Remove "v" suffix
    .replace(/\s*gx$/i, '') // Remove "gx" suffix
    .replace(/\s*break$/i, '') // Remove "break" suffix
    .replace(/\s*prism\s*star$/i, '') // Remove "prism star" suffix
    .replace(/\s*tag\s*team$/i, '') // Remove "tag team" suffix
    .replace(/\s*&\s*[^&]*$/i, '') // Remove everything after "&" for tag team cards
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();

  // Handle special cases
  const specialCases: Record<string, string> = {
    'mr-mime': 'mr-mime',
    'mime-jr': 'mime-jr',
    'ho-oh': 'ho-oh',
    'porygon-z': 'porygon-z',
    'jangmo-o': 'jangmo-o',
    'hakamo-o': 'hakamo-o',
    'kommo-o': 'kommo-o',
    'type-null': 'type-null',
    'tapu-koko': 'tapu-koko',
    'tapu-lele': 'tapu-lele',
    'tapu-bulu': 'tapu-bulu',
    'tapu-fini': 'tapu-fini',
    'nidoran-f': 'nidoran-f',
    'nidoran-m': 'nidoran-m',
    'farfetchd': 'farfetchd',
    'sirfetchd': 'sirfetchd',
  };

  if (specialCases[cleanName]) {
    return specialCases[cleanName];
  }

  return cleanName;
}

export function getPokemonImageUrl(pokemon: Pokemon | null): string | null {
  if (!pokemon) return null;

  // Prefer official artwork, then home, then default sprite
  return (
    pokemon.sprites.other['official-artwork']?.front_default ||
    pokemon.sprites.other.home?.front_default ||
    pokemon.sprites.front_default
  );
}

export function getPokemonTypeColor(pokemon: Pokemon | null): string {
  if (!pokemon || !pokemon.types.length) return 'bg-gray-500';

  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  };

  const primaryType = pokemon.types[0].type.name;
  return typeColors[primaryType] || 'bg-gray-500';
}