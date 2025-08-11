import { Trophy, Clock, Zap, Star, Target, Crown, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Match } from "@shared/schema";
import PokemonImage from "./PokemonImage";

interface MatchSummaryCardProps {
  match: Match;
  onClick?: () => void;
}

export default function MatchSummaryCard({ match, onClick }: MatchSummaryCardProps) {
  const { toast } = useToast();
  const isWinner = (player: string) => match.winner === player;
  
  const getTypeGradient = () => {
    // Pokemon type-inspired gradients
    const gradients = [
      "from-red-500 to-orange-500", // Fire
      "from-blue-500 to-cyan-500", // Water
      "from-green-500 to-emerald-500", // Grass
      "from-yellow-500 to-amber-500", // Electric
      "from-purple-500 to-violet-500", // Psychic
      "from-pink-500 to-rose-500", // Fairy
      "from-gray-600 to-slate-600", // Steel
      "from-indigo-500 to-blue-600", // Dragon
    ];
    
    const hash = match.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    try {
      await navigator.clipboard.writeText(match.fullLog);
      toast({
        title: "Texto exportado",
        description: `El log completo de "${match.title}" se ha copiado al portapapeles.`,
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo copiar el texto al portapapeles.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${onClick ? 'hover:border-primary' : ''}`}
      onClick={onClick}
    >
      {/* Header with gradient */}
      <div className={`h-3 bg-gradient-to-r ${getTypeGradient()} rounded-t-lg`}></div>
      
      <CardContent className="p-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-2 text-6xl">⚡</div>
          <div className="absolute bottom-2 left-2 text-4xl">🎯</div>
        </div>
        
        <div className="relative z-10">
          {/* Match title and winner badge */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-on-surface leading-tight">{match.title}</h3>
            <div className="flex items-center space-x-1 bg-success/20 text-success px-2 py-1 rounded-full text-xs font-medium">
              <Crown className="w-3 h-3" />
              <span>{match.winner}</span>
            </div>
          </div>

          {/* Players section */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`p-3 rounded-lg transition-all ${isWinner(match.player1) ? 'bg-success/10 border border-success/30' : 'bg-surface-variant'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {isWinner(match.player1) && <Trophy className="w-4 h-4 text-success" />}
                <span className={`font-medium text-sm ${isWinner(match.player1) ? 'text-success' : 'text-on-surface'}`}>
                  {match.player1}
                </span>
              </div>
              
              {/* Pokemon images for player 1 */}
              <div className="flex items-center space-x-1 mb-2">
                {match.player1Pokemon.slice(0, 3).map((pokemon, index) => (
                  <PokemonImage
                    key={`${match.id}-p1-${index}`}
                    pokemonName={pokemon}
                    size="sm"
                    className="flex-shrink-0"
                  />
                ))}
                {match.player1Pokemon.length > 3 && (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-500">
                    +{match.player1Pokemon.length - 3}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-on-surface-variant mt-1">
                {match.player1Pokemon.slice(0, 2).join(", ")}
                {match.player1Pokemon.length > 2 && "..."}
              </div>
              <div className="text-xs text-on-surface-variant">
                {match.player1Prizes} premios
              </div>
            </div>

            <div className={`p-3 rounded-lg transition-all ${isWinner(match.player2) ? 'bg-success/10 border border-success/30' : 'bg-surface-variant'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {isWinner(match.player2) && <Trophy className="w-4 h-4 text-success" />}
                <span className={`font-medium text-sm ${isWinner(match.player2) ? 'text-success' : 'text-on-surface'}`}>
                  {match.player2}
                </span>
              </div>
              
              {/* Pokemon images for player 2 */}
              <div className="flex items-center space-x-1 mb-2">
                {match.player2Pokemon.slice(0, 3).map((pokemon, index) => (
                  <PokemonImage
                    key={`${match.id}-p2-${index}`}
                    pokemonName={pokemon}
                    size="sm"
                    className="flex-shrink-0"
                  />
                ))}
                {match.player2Pokemon.length > 3 && (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-500">
                    +{match.player2Pokemon.length - 3}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-on-surface-variant mt-1">
                {match.player2Pokemon.slice(0, 2).join(", ")}
                {match.player2Pokemon.length > 2 && "..."}
              </div>
              <div className="text-xs text-on-surface-variant">
                {match.player2Prizes} premios
              </div>
            </div>
          </div>

          {/* Match stats */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{match.turns} turnos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>{match.player1Prizes + match.player2Prizes} premios</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div>{formatTime(match.uploadedAt)}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Exportar texto completo"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        </div>
      </CardContent>
    </Card>
  );
}