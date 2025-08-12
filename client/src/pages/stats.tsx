import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, TrendingUp, Users, Swords, Target, Clock, Award, BarChart3, Shield, Star, Calendar } from "lucide-react";
import type { Match } from "@shared/schema";

interface StatsOverview {
  totalMatches: number;
  totalPlayers: number;
  avgTurns: number;
  totalTurns: number;
  maxTurns: number;
  minTurns: number;
}

interface PlayerRanking {
  name: string;
  wins: number;
  losses: number;
  matches: number;
  winRate: number;
  avgTurns: number;
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

export default function StatsPage() {
  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches/global"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate comprehensive statistics
  const playerStats: { [key: string]: PlayerRanking } = {};
  const cardUsage: { [key: string]: number } = {};
  const pokemonUsage: { [key: string]: number } = {};
  const winConditions: { [key: string]: number } = {};
  const matchesByDate: { [key: string]: number } = {};
  
  let totalTurns = 0;
  let maxTurnsInMatch = 0;
  let minTurnsInMatch = Number.MAX_SAFE_INTEGER;

  // Process all matches
  matches.forEach(match => {
    const matchDate = new Date(match.uploadedAt || Date.now()).toLocaleDateString();
    matchesByDate[matchDate] = (matchesByDate[matchDate] || 0) + 1;

    // Initialize player stats
    [match.player1, match.player2].forEach(playerName => {
      if (!playerStats[playerName]) {
        playerStats[playerName] = {
          name: playerName,
          wins: 0,
          losses: 0,
          matches: 0,
          winRate: 0,
          avgTurns: 0
        };
      }
      playerStats[playerName].matches++;
    });

    // Update wins/losses
    if (match.winner && playerStats[match.winner]) {
      playerStats[match.winner].wins++;
    }
    
    const loser = match.winner === match.player1 ? match.player2 : match.player1;
    if (playerStats[loser]) {
      playerStats[loser].losses++;
    }

    // Track turns
    totalTurns += match.turns;
    maxTurnsInMatch = Math.max(maxTurnsInMatch, match.turns);
    minTurnsInMatch = Math.min(minTurnsInMatch, match.turns);

    // Track win conditions
    if (match.winCondition) {
      winConditions[match.winCondition] = (winConditions[match.winCondition] || 0) + 1;
    }

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

  // Calculate derived stats for players
  Object.values(playerStats).forEach(player => {
    player.winRate = player.matches > 0 ? (player.wins / player.matches) * 100 : 0;
    
    const playerMatches = matches.filter(m => m.player1 === player.name || m.player2 === player.name);
    player.avgTurns = playerMatches.length > 0 
      ? playerMatches.reduce((sum, m) => sum + m.turns, 0) / playerMatches.length 
      : 0;
  });

  // Generate overview stats
  const overview: StatsOverview = {
    totalMatches: matches.length,
    totalPlayers: Object.keys(playerStats).length,
    avgTurns: matches.length > 0 ? totalTurns / matches.length : 0,
    totalTurns,
    maxTurns: maxTurnsInMatch,
    minTurns: minTurnsInMatch === Number.MAX_SAFE_INTEGER ? 0 : minTurnsInMatch
  };

  // Sort data for display
  const topPlayers = Object.values(playerStats)
    .filter(p => p.matches >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 15);

  const topCards = Object.entries(cardUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);

  const topPokemon = Object.entries(pokemonUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);

  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Estadísticas Completas
          </h1>
          <p className="text-on-surface-variant">
            Análisis detallado de todas las {overview.totalMatches} partidas registradas
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partidas</CardTitle>
              <Swords className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalMatches}</div>
              <p className="text-xs text-muted-foreground">
                {overview.totalPlayers} jugadores únicos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turnos Promedio</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.avgTurns.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Rango: {overview.minTurns} - {overview.maxTurns} turnos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Players */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Jugadores
              </CardTitle>
              <CardDescription>
                Mejores jugadores por tasa de victoria (mínimo 3 partidas)
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
                          {player.wins}W - {player.losses}L ({player.matches} partidas)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {player.winRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {player.avgTurns.toFixed(1)} turnos promedio
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
                  .sort(([,a], [,b]) => b - a)
                  .map(([condition, count]) => (
                    <div key={condition} className="flex items-center justify-between p-2 bg-surface-variant rounded">
                      <p className="font-medium text-on-surface text-sm">{condition}</p>
                      <div className="text-right">
                        <p className="font-bold text-primary">{count}</p>
                        <p className="text-xs text-on-surface-variant">
                          {((count / matches.length) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Pokemon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Pokémon Más Populares
              </CardTitle>
              <CardDescription>
                Los Pokémon más utilizados en el meta actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topPokemon.map(([pokemon, count], index) => (
                  <div key={pokemon} className="flex items-center justify-between p-2 hover:bg-surface-variant rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-on-surface-variant w-8">#{index + 1}</span>
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{count}</Badge>
                      <span className="text-xs text-on-surface-variant">
                        {((count / (matches.length * 2)) * 100).toFixed(1)}%
                      </span>
                    </div>
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
                Las cartas dominantes del meta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topCards.map(([card, count], index) => (
                  <div key={card} className="flex items-center justify-between p-2 hover:bg-surface-variant rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-on-surface-variant w-8">#{index + 1}</span>
                      <p className="font-medium text-on-surface truncate max-w-48" title={card}>{card}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{count}</Badge>
                      <span className="text-xs text-on-surface-variant">
                        {((count / (matches.length * 2)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas 10 partidas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-surface-variant rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="w-16 text-center">
                      T{match.turns}
                    </Badge>
                    <div>
                      <p className="font-medium text-on-surface">
                        {match.player1} vs {match.player2}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        Ganador: <span className="font-medium">{match.winner}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {((match.player1TotalDamage || 0) + (match.player2TotalDamage || 0)).toLocaleString()} daño
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(match.uploadedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}