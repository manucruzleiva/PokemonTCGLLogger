import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "@/components/Navigation";

interface PokemonData {
  name: string;
  count: number;
  imageUrl: string | null;
}

interface PokemonSummary {
  totalUniquePokemon: number;
  totalMatches: number;
  totalPlayers: number;
}

interface PokemonResponse {
  summary: PokemonSummary;
  allPokemon: PokemonData[];
}

export default function PokemonReport() {
  const { data: pokemonData, isLoading, error } = useQuery<PokemonResponse>({
    queryKey: ['/api/pokemon/complete-report'],
    queryFn: async () => {
      const response = await fetch('/api/pokemon/complete-report');
      if (!response.ok) {
        throw new Error('Failed to fetch Pokemon data');
      }
      return response.json();
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-500">Error cargando datos de Pokémon: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Pokémon Utilizados</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Lista completa de todos los Pokémon utilizados en las partidas registradas
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-4">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-32 mb-4" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {pokemonData?.summary?.totalUniquePokemon || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Pokémon únicos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {pokemonData?.summary?.totalMatches || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Partidas analizadas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {pokemonData?.summary?.totalPlayers || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Jugadores únicos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pokemonData?.allPokemon?.map((pokemon: any) => (
              <Card key={pokemon.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{pokemon.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {pokemon.count}x
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    {pokemon.imageUrl ? (
                      <img
                        src={pokemon.imageUrl}
                        alt={pokemon.name}
                        className="w-24 h-24 object-contain mb-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-gray-500 dark:text-gray-400 text-xs text-center">
                          Sin imagen
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Usado {pokemon.count} {pokemon.count === 1 ? 'vez' : 'veces'}
                      {pokemon.usedBy && (
                        <div className="text-xs mt-1">
                          Por: {pokemon.usedBy.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pokemonData?.allPokemon?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron Pokémon en las partidas registradas.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
      </div>
    </div>
  );
}