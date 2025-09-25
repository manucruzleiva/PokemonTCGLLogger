import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, TrendingUp, Users, Swords, Target, Clock, Award } from "lucide-react";
import type { Match } from "@shared/schema";

interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  avgTurns: number;
  topPokemon: string[];
}

interface CardStats {
  name: string;
  usage: number;
  winRate: number;
}

// Blacklists for filtering statistics
const POKEMON_BLACKLIST = ['earthen vessel'];

const CARD_BLACKLIST = [
  'basic psychic energy', 'basic fire energy', 'basic water energy', 'basic lightning energy',
  'basic grass energy', 'basic fighting energy', 'basic darkness energy', 'basic metal energy',
  'psychic energy', 'fire energy', 'water energy', 'lightning energy',
  'grass energy', 'fighting energy', 'darkness energy', 'metal energy'
];

// Function to clean card names by removing codes
function cleanCardName(cardName: string): string {
  return cardName
    // Remove card codes like sv10_185, PAL 123, zsv10-5_67, etc.
    .replace(/\b[a-zA-Z]+\d+[-_]\d+(_\d+)?\b/g, '') // Patterns like sv10_185, zsv10-5_67
    .replace(/\b[A-Z]{2,4}\s+\d+\b/g, '') // Patterns like PAL 123, TEU 45
    .replace(/\([^)]*\)/g, '') // Remove anything in parentheses
    .replace(/^\([a-zA-Z0-9_-]+\)\s*/, '') // Remove card codes at the beginning like (sv7_28)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}



// Function to get Pokemon image from PokeAPI
function getPokemonImage(pokemonName: string): string {
  // Clean the pokemon name and format for API
  const cleanName = pokemonName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-ex$|-v$|-vmax$|-vstar$|-gx$|-tag-team$/, '')
    .replace(/mega-/, '')
    .replace(/alolan-/, '')
    .replace(/galarian-/, '')
    .replace(/hisuian-/, '')
    .replace(/paldean-/, '');

  // Map common Pokemon names to their PokeAPI IDs for better accuracy
  const pokemonMap: { [key: string]: number } = {
    'charizard': 6, 'pikachu': 25, 'mewtwo': 150, 'mew': 151,
    'lugia': 249, 'rayquaza': 384, 'dialga': 483, 'palkia': 484,
    'arceus': 493, 'reshiram': 643, 'zekrom': 644, 'kyurem': 646
  };

  // Use mapped ID if available, otherwise try with name
  const pokemonId = pokemonMap[cleanName];
  if (pokemonId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png`;
  }

  return `https://img.pokemondb.net/sprites/home/normal/${cleanName}.png`;
}

export default function StatisticsPage() {
  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches/global"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate player statistics
  const playerStats: { [key: string]: PlayerStats } = {};
  const cardUsage: { [key: string]: number } = {};
  const pokemonUsage: { [key: string]: number } = {};
  let totalTurns = 0;
  let maxTurnsInMatch = 0;

  matches.forEach(match => {
    // Initialize player stats
    [match.player1, match.player2].forEach(playerName => {
      if (!playerStats[playerName]) {
        playerStats[playerName] = {
          name: playerName,
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          avgTurns: 0,
          topPokemon: []
        };
      }
      playerStats[playerName].totalMatches++;
    });

    // Update wins/losses
    if (playerStats[match.winner]) {
      playerStats[match.winner].wins++;
    }
    const loser = match.winner === match.player1 ? match.player2 : match.player1;
    if (playerStats[loser]) {
      playerStats[loser].losses++;
    }

    // Track turns
    totalTurns += match.turns;
    maxTurnsInMatch = Math.max(maxTurnsInMatch, match.turns);

    // Track card usage (excluding blacklisted cards)
    [...(match.player1Cards || []), ...(match.player2Cards || [])].forEach(cardEntry => {
      const rawCardName = cardEntry.split(' (')[0]; // Remove count info first
      const cleanedCardName = cleanCardName(rawCardName); // Then clean codes
      
      // Only count if there's a valid name after cleaning and not in blacklist
      if (cleanedCardName && 
          cleanedCardName.length > 1 && 
          !CARD_BLACKLIST.includes(cleanedCardName.toLowerCase())) {
        cardUsage[cleanedCardName] = (cardUsage[cleanedCardName] || 0) + 1;
      }
    });

    // Track Pokemon usage (excluding blacklisted Pokemon)
    [...match.player1Pokemon, ...match.player2Pokemon].forEach(pokemon => {
      const cleanedPokemon = cleanCardName(pokemon);
      
      // Only count if there's a valid name after cleaning and not in blacklist
      if (cleanedPokemon && 
          cleanedPokemon.length > 1 && 
          !POKEMON_BLACKLIST.includes(cleanedPokemon.toLowerCase())) {
        pokemonUsage[cleanedPokemon] = (pokemonUsage[cleanedPokemon] || 0) + 1;
      }
    });
  });

  // Calculate derived stats
  Object.values(playerStats).forEach(player => {
    player.winRate = player.totalMatches > 0 ? (player.wins / player.totalMatches) * 100 : 0;
    player.avgTurns = matches.filter(m => m.player1 === player.name || m.player2 === player.name)
      .reduce((sum, m) => sum + m.turns, 0) / player.totalMatches;
  });

  // Sort and get top entries
  const topPlayers = Object.values(playerStats)
    .filter(p => p.totalMatches >= 3) // Only players with 3+ matches
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);

  const topCards = Object.entries(cardUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const topPokemon = Object.entries(pokemonUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const winConditions = matches.reduce((acc, match) => {
    acc[match.winCondition || 'Unknown'] = (acc[match.winCondition || 'Unknown'] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const avgTurnsPerMatch = matches.length > 0 ? totalTurns / matches.length : 0;

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-2">Estadísticas del Juego</h1>
          <p className="text-on-surface-variant">
            Análisis completo de {matches.length} partidas registradas
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Partidas</CardTitle>
              <Swords className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.length}</div>
              <p className="text-xs text-muted-foreground">
                Partidas registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio de Turnos</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgTurnsPerMatch.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Turnos por partida
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Jugadores
              </CardTitle>
              <CardDescription>
                Top jugadores por tasa de victoria (mín. 3 partidas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-3 bg-surface-variant rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-on-surface">{player.name}</p>
                        <p className="text-sm text-on-surface-variant">
                          {player.wins}W - {player.losses}L
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {player.winRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {player.totalMatches} partidas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Win Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                Condiciones de Victoria
              </CardTitle>
              <CardDescription>
                Cómo terminan las partidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(winConditions)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([condition, count]) => (
                    <div key={condition} className="flex items-center justify-between p-3 bg-surface-variant rounded-lg">
                      <p className="font-medium text-on-surface">{condition}</p>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{count as number}</p>
                        <p className="text-xs text-on-surface-variant">
                          {(((count as number) / matches.length) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Pokemon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Pokémon Más Populares
              </CardTitle>
              <CardDescription>
                Pokémon más utilizados en las partidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topPokemon.map(([pokemon, count], index) => (
                  <div key={pokemon} className="flex items-center justify-between p-2 hover:bg-surface-variant rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-on-surface-variant w-6">#{index + 1}</span>
                      <img 
                        src={getPokemonImage(pokemon)}
                        alt={pokemon}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <p className="font-medium text-on-surface">{pokemon}</p>
                    </div>
                    <Badge variant="outline">{count} usos</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Cartas Más Utilizadas
              </CardTitle>
              <CardDescription>
                Cartas más populares del meta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topCards.map(([card, count], index) => (
                  <div key={card} className="flex items-center justify-between p-2 hover:bg-surface-variant rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-on-surface-variant w-6">#{index + 1}</span>
                      <p className="font-medium text-on-surface truncate max-w-48">{card}</p>
                    </div>
                    <Badge variant="outline">{count} usos</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}