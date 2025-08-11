import { useEffect, useState } from "react";
import { Zap, Swords, Shield, Target } from "lucide-react";

interface BattleLoadingScreenProps {
  message?: string;
  submessage?: string;
  progress?: number;
}

export default function BattleLoadingScreen({ 
  message = "Procesando partida...", 
  submessage = "Analizando movimientos de combate",
  progress = 0
}: BattleLoadingScreenProps) {
  const [battleFrame, setBattleFrame] = useState(0);
  const [energyPulse, setEnergyPulse] = useState(0);
  const [sparkEffects, setSparkEffects] = useState<Array<{id: number, x: number, y: number, scale: number}>>([]);

  useEffect(() => {
    // Battle animation frames
    const battleInterval = setInterval(() => {
      setBattleFrame(prev => (prev + 1) % 6);
    }, 300);

    // Energy pulse effect
    const pulseInterval = setInterval(() => {
      setEnergyPulse(prev => (prev + 1) % 100);
    }, 50);

    // Generate spark effects
    const sparkInterval = setInterval(() => {
      setSparkEffects(prev => [
        ...prev.slice(-8), // Keep only last 8 sparks
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          scale: Math.random() * 0.5 + 0.5
        }
      ]);
    }, 200);

    return () => {
      clearInterval(battleInterval);
      clearInterval(pulseInterval);
      clearInterval(sparkInterval);
    };
  }, []);

  const battleEmojis = ["⚔️", "💥", "⚡", "🔥", "💫", "✨"];
  const currentBattleEmoji = battleEmojis[battleFrame];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(0,191,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,191,255,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '30px 30px',
             animation: 'grid-move 3s linear infinite'
           }}>
      </div>

      {/* Energy particles */}
      {sparkEffects.map((spark) => (
        <div
          key={spark.id}
          className="absolute animate-ping"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            transform: `scale(${spark.scale})`,
            animationDuration: '1s'
          }}
        >
          <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
        </div>
      ))}

      {/* Battle arena circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer energy ring */}
          <div 
            className="w-96 h-96 border-4 border-blue-400/30 rounded-full animate-spin"
            style={{ animationDuration: '8s' }}
          ></div>
          
          {/* Middle energy ring */}
          <div 
            className="absolute inset-8 border-2 border-purple-400/40 rounded-full animate-spin"
            style={{ animationDuration: '6s', animationDirection: 'reverse' }}
          ></div>
          
          {/* Inner energy core */}
          <div 
            className="absolute inset-16 border border-yellow-400/50 rounded-full animate-pulse"
            style={{ 
              animationDuration: '2s',
              boxShadow: `0 0 ${20 + Math.sin(energyPulse * 0.1) * 10}px rgba(255, 255, 0, 0.5)`
            }}
          ></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Battle emoji with effects */}
        <div className="mb-8 relative">
          <div 
            className="text-8xl animate-bounce"
            style={{ 
              animationDuration: '0.8s',
              filter: `drop-shadow(0 0 20px rgba(255, 255, 0, 0.8))`
            }}
          >
            {currentBattleEmoji}
          </div>
          
          {/* Energy burst effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-32 h-32 bg-gradient-radial from-yellow-400/20 to-transparent rounded-full animate-pulse"
              style={{ animationDuration: '1.5s' }}
            ></div>
          </div>
        </div>

        {/* Status display */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30">
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
            {message}
          </h2>
          
          <p className="text-blue-200 mb-6">{submessage}</p>

          {/* Progress bar with battle theme */}
          <div className="space-y-4">
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            
            {/* Battle stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-blue-300">
                <Swords className="w-4 h-4" />
                <span>Poder: {Math.floor(progress * 10)}%</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-300">
                <Shield className="w-4 h-4" />
                <span>Defensa: {Math.floor(progress * 8)}%</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-300">
                <Zap className="w-4 h-4" />
                <span>Velocidad: {Math.floor(progress * 12)}%</span>
              </div>
              <div className="flex items-center space-x-2 text-red-300">
                <Target className="w-4 h-4" />
                <span>Precisión: {Math.floor(progress * 9)}%</span>
              </div>
            </div>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      {/* Additional CSS for grid animation */}
      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }
      `}</style>
    </div>
  );
}