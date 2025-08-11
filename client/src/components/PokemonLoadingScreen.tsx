import { useEffect, useState } from "react";
import { Zap, Star, Trophy } from "lucide-react";

interface PokemonLoadingScreenProps {
  message?: string;
  submessage?: string;
}

export default function PokemonLoadingScreen({ 
  message = "Analizando estadísticas...", 
  submessage = "Procesando datos de combate" 
}: PokemonLoadingScreenProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    // Pokeball animation frames
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 4);
    }, 200);

    // Generate sparkle effects
    const sparkleArray = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setSparkles(sparkleArray);

    return () => clearInterval(interval);
  }, []);

  const pokeBallFrames = [
    "🔴", "⚪", "🔵", "⚪"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-white/5" 
             style={{
               backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
               backgroundSize: '20px 20px'
             }}>
        </div>
        
        {/* Floating sparkles */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute animate-pulse"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animationDelay: `${sparkle.delay}s`
            }}
          >
            <Star className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        ))}

        {/* Battle energy waves */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-400/20 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center">
        {/* Pokeball spinner */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl animate-bounce" style={{ animationDuration: '1s' }}>
              {pokeBallFrames[currentFrame]}
            </div>
            
            {/* Energy ring around pokeball */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-yellow-400/50 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-2 border-white/30 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
            </div>
          </div>
        </div>

        {/* Loading text with typewriter effect */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
            {message}
          </h2>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center space-x-1">
            <span className="text-white text-lg">{submessage}</span>
            <div className="flex space-x-1 ml-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Battle stats simulation */}
          <div className="mt-8 space-y-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                  Poder de Combate
                </span>
                <span className="text-yellow-400 font-bold">9001</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full animate-pulse" 
                     style={{ width: '87%' }}></div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-blue-400" />
                  Progreso de Análisis
                </span>
                <span className="text-blue-400 font-bold">78%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full animate-pulse" 
                     style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="mt-12 flex justify-center space-x-8 text-4xl opacity-50">
          <div className="animate-bounce" style={{ animationDelay: '0s' }}>⚡</div>
          <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎯</div>
          <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>🔥</div>
          <div className="animate-bounce" style={{ animationDelay: '0.6s' }}>💫</div>
        </div>
      </div>
    </div>
  );
}