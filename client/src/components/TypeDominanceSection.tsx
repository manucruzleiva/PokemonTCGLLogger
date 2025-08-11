import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Target, Swords, TrendingUp } from "lucide-react";

interface TypeDominanceStats {
  type: string;
  count: number;
  winRate: number;
  totalDamage: number;
  avgDamagePerUse: number;
  attacksCount: number;
  effectiveness: 'High' | 'Medium' | 'Low';
}

interface AttackStats {
  name: string;
  count: number;
  totalDamage: number;
  avgDamage: number;
}

interface StatsData {
  typeDominance: TypeDominanceStats[];
  topAttacks: AttackStats[];
  totalDamageDealt: number;
  avgDamagePerMatch: number;
  totalAttacks: number;
  avgAttacksPerMatch: number;
}

export default function TypeDominanceSection() {
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      Fire: "bg-red-500 text-white",
      Water: "bg-blue-500 text-white",
      Grass: "bg-green-500 text-white",
      Electric: "bg-yellow-500 text-black",
      Psychic: "bg-purple-500 text-white",
      Fighting: "bg-orange-600 text-white",
      Darkness: "bg-gray-800 text-white",
      Metal: "bg-gray-500 text-white",
      Fairy: "bg-pink-500 text-white",
      Dragon: "bg-indigo-600 text-white",
      Colorless: "bg-gray-400 text-white"
    };
    return typeColors[type] || "bg-gray-400 text-white";
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'High': return "bg-green-500 text-white";
      case 'Medium': return "bg-yellow-500 text-black";
      case 'Low': return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Análisis de Tipos y Daño</span>
          </CardTitle>
          <CardDescription>Cargando análisis de dominancia por tipos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-destructive" />
            <span>Error en Análisis de Tipos</span>
          </CardTitle>
          <CardDescription>No se pudo cargar el análisis de tipos dominantes</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Damage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Swords className="w-5 h-5 text-primary" />
            <span>Resumen de Daño</span>
          </CardTitle>
          <CardDescription>
            Estadísticas generales de ataques y daño en todas las partidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{(stats.totalDamageDealt || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Daño Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.avgDamagePerMatch || 0}</div>
              <div className="text-sm text-muted-foreground">Daño Promedio/Partida</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalAttacks || 0}</div>
              <div className="text-sm text-muted-foreground">Ataques Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.avgAttacksPerMatch || 0}</div>
              <div className="text-sm text-muted-foreground">Ataques/Partida</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type Dominance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Dominancia por Tipos de Pokemon</span>
          </CardTitle>
          <CardDescription>
            Análisis de efectividad y uso por tipo de Pokemon en el meta actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(stats.typeDominance || []).slice(0, 8).map((typeStats, index) => (
              <div key={typeStats.type} className="flex items-center space-x-4 p-4 rounded-lg bg-card border">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getTypeColor(typeStats.type)}>
                      {typeStats.type}
                    </Badge>
                    <Badge className={getEffectivenessColor(typeStats.effectiveness)}>
                      {typeStats.effectiveness}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {typeStats.count} usos
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Tasa Victoria</div>
                      <div className={`${typeStats.winRate >= 60 ? 'text-green-600' : typeStats.winRate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {typeStats.winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Daño Total</div>
                      <div className="text-foreground">{typeStats.totalDamage.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Daño Promedio</div>
                      <div className="text-foreground">{typeStats.avgDamagePerUse.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Ataques</div>
                      <div className="text-foreground">{typeStats.attacksCount}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <Progress value={typeStats.winRate} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Attacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Ataques Más Devastadores</span>
          </CardTitle>
          <CardDescription>
            Los ataques que más daño promedio infligen por uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats.topAttacks || []).slice(0, 10).map((attack, index) => (
              <div key={attack.name} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-6 h-6 bg-destructive/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-destructive">#{index + 1}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate" title={attack.name}>
                    {attack.name}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Usos: {attack.count}</span>
                    <span>Daño Total: {attack.totalDamage.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-destructive">{Math.round(attack.avgDamage)}</div>
                  <div className="text-xs text-muted-foreground">daño prom.</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}