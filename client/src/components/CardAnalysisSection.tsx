import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, TrendingUp, Database, Zap, Shield, Gamepad2 } from "lucide-react";
import CardImage from "./CardImage";
import type { PokemonType, TrainerCategory } from "@/types/card";

interface EnhancedCardStats {
  name: string;
  count: number;
  winRate: number;
  avgPerMatch: number;
  cardType: string;
  isTrainer: boolean;
  isPokemon: boolean;
  isEnergy: boolean;
  trainerCategory?: string;
  pokemonType?: string;
  imageUrl?: string;
  largeImageUrl?: string;
  cardId?: string;
  effectiveness: "High" | "Medium" | "Low";
  recommendation: string;
}

interface CardCategoryAnalysis {
  pokemon: {
    total: number;
    byType: Record<string, number>;
    mostEffective: Array<{name: string; winRate: number}>;
  };
  trainers: {
    total: number;
    supporters: number;
    items: number;
    stadiums: number;
    tools: number;
    mostEffective: Array<{name: string; category: string; winRate: number}>;
  };
  energy: {
    total: number;
    basic: number;
    special: number;
    mostUsed: string[];
  };
  metaAnalysis: {
    averageCardsPerDeck: number;
    trainerRatio: number;
    pokemonRatio: number;
    energyRatio: number;
    deckArchetypes: string[];
  };
}

interface CardAnalysisData {
  cardEffectiveness: EnhancedCardStats[];
  deckComposition: CardCategoryAnalysis;
  recommendations: string[];
}

export default function CardAnalysisSection() {
  const { data: analysis, isLoading, error } = useQuery<CardAnalysisData>({
    queryKey: ["/api/card-analysis"],
    staleTime: 2 * 60 * 1000, // 2 minutes for quicker updates
    refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Análisis Avanzado de Cartas</span>
          </CardTitle>
          <CardDescription>Cargando datos del Pokemon TCG API...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-on-surface-variant">Conectando con la base de datos de Pokemon TCG...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-error" />
            <span>Error en Análisis de Cartas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-error">No se pudo cargar el análisis avanzado de cartas.</p>
        </CardContent>
      </Card>
    );
  }

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case "High": return "text-success bg-success/10";
      case "Medium": return "text-warning bg-warning/10";
      case "Low": return "text-error bg-error/10";
      default: return "text-on-surface-variant bg-surface-variant";
    }
  };

  const getCardTypeIcon = (cardType: string, isTrainer: boolean, isPokemon: boolean) => {
    if (isPokemon) return <Gamepad2 className="w-4 h-4 text-blue-500" />;
    if (isTrainer) return <Target className="w-4 h-4 text-purple-500" />;
    return <Zap className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-8">
      {/* Deck Composition Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Composición del Meta</span>
          </CardTitle>
          <CardDescription>
            Análisis basado en la base de datos oficial de Pokemon TCG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pokemon Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-on-surface flex items-center">
                <Gamepad2 className="w-4 h-4 mr-2 text-blue-500" />
                Pokemon ({analysis.deckComposition.pokemon.total})
              </h4>
              <div className="space-y-2">
                {Object.entries(analysis.deckComposition.pokemon.byType)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Trainer Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-on-surface flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-500" />
                Entrenadores ({analysis.deckComposition.trainers.total})
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Supporters</span>
                  <Badge variant="secondary">{analysis.deckComposition.trainers.supporters}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Items</span>
                  <Badge variant="secondary">{analysis.deckComposition.trainers.items}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Stadiums</span>
                  <Badge variant="secondary">{analysis.deckComposition.trainers.stadiums}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Tools</span>
                  <Badge variant="secondary">{analysis.deckComposition.trainers.tools}</Badge>
                </div>
              </div>
            </div>

            {/* Energy Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-on-surface flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Energía ({analysis.deckComposition.energy.total})
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Básica</span>
                  <Badge variant="secondary">{analysis.deckComposition.energy.basic}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Especial</span>
                  <Badge variant="secondary">{analysis.deckComposition.energy.special}</Badge>
                </div>
              </div>
            </div>

            {/* Meta Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium text-on-surface flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Meta Actual
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Cartas promedio</span>
                  <Badge variant="secondary">{analysis.deckComposition.metaAnalysis.averageCardsPerDeck}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Pokemon</span>
                    <span>{analysis.deckComposition.metaAnalysis.pokemonRatio.toFixed(1)}%</span>
                  </div>
                  <Progress value={analysis.deckComposition.metaAnalysis.pokemonRatio} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Entrenadores</span>
                    <span>{analysis.deckComposition.metaAnalysis.trainerRatio.toFixed(1)}%</span>
                  </div>
                  <Progress value={analysis.deckComposition.metaAnalysis.trainerRatio} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Cartas Más Efectivas</span>
          </CardTitle>
          <CardDescription>
            Análisis de efectividad basado en tasas de victoria y uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {analysis.cardEffectiveness.slice(0, 12).map((card, index) => (
              <div key={card.name} className="relative">
                <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-primary/90 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  #{index + 1}
                </div>
                <CardImage
                  cardName={card.name}
                  imageUrl={card.imageUrl}
                  largeImageUrl={card.largeImageUrl}
                  cardType={card.cardType}
                  isTrainer={card.isTrainer}
                  isPokemon={card.isPokemon}
                  isEnergy={card.isEnergy}
                  trainerCategory={card.trainerCategory as TrainerCategory}
                  pokemonType={card.pokemonType as PokemonType}
                  count={card.count}
                  winRate={card.winRate}
                  showStats={true}
                  size="medium"
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Recomendaciones del Meta</span>
            </CardTitle>
            <CardDescription>
              Sugerencias basadas en el análisis de efectividad de cartas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                  <p className="text-sm text-on-surface">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}