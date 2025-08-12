import { Construction, Hammer, Wrench, Cog, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function VisualStatsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <Construction className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Estadísticas en Construcción
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Estamos construyendo una experiencia de estadísticas increíble para ti. 
              Pronto podrás ver análisis detallados de tus partidas.
            </p>
          </div>

          {/* Construction Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                <Hammer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Análisis de Cartas</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                <Wrench className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Métricas de Juego</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3">
                <Cog className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ranking de Jugadores</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insights Avanzados</span>
            </div>
          </div>

          {/* Features Coming Soon */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Próximamente
              </CardTitle>
              <CardDescription>
                Funciones que estarán disponibles pronto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <h4 className="font-medium">📊 Análisis Detallado</h4>
                  <p className="text-sm text-muted-foreground">
                    Estadísticas profundas de tus partidas y estrategias
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🏆 Rankings</h4>
                  <p className="text-sm text-muted-foreground">
                    Comparaciones y clasificaciones entre jugadores
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">📈 Gráficos Interactivos</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualizaciones dinámicas de tu progreso
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🎯 Recomendaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    Sugerencias para mejorar tu gameplay
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Subir Partidas
            </Button>
            <Button 
              onClick={() => navigate("/global-matches")}
              variant="outline"
            >
              Ver Todas las Partidas
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-12 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progreso de Desarrollo</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: "75%" }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Las estadísticas estarán disponibles próximamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}