import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, BarChart3, Zap, Star, Target, FileText, TrendingUp, Award, Camera, Mail } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-variant">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Trophy className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-on-surface mb-6">
            Pokémon Trainer
            <span className="block text-primary">Academia</span>
          </h1>
          
          <p className="text-xl text-on-surface-variant mb-8 max-w-3xl mx-auto">
            Un repositorio simple para almacenar y consultar tus partidas de Pokémon TCG Live. 
            Sube logs de partidas y mantén un registro organizado de tu historial de juego.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            <Users className="w-5 h-5 mr-2" />
            Iniciar Sesión
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Almacenar Partidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-on-surface-variant">
                Guarda los logs de tus partidas de Pokémon TCG Live de forma segura. 
                Copia y pega directamente desde el juego.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Historial Organizado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-on-surface-variant">
                Consulta tu historial completo de partidas con filtros por jugador, 
                fecha y otros criterios para encontrar partidas específicas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-lg mx-auto bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Comienza Ahora</h3>
              <p className="text-on-surface-variant mb-6">
                Únete y comienza a construir tu repositorio personal de partidas de Pokémon TCG Live. 
                Configura tu nombre de jugador y guarda tu primera partida.
              </p>
              <Button 
                size="lg"
                className="w-full text-lg"
                onClick={() => window.location.href = '/api/login'}
              >
                <Users className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}