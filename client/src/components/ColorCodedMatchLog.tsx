import { useMemo } from "react";

interface ColorCodedMatchLogProps {
  logText: string;
  player1: string;
  player2: string;
}

export default function ColorCodedMatchLog({ logText, player1, player2 }: ColorCodedMatchLogProps) {
  const processedLog = useMemo(() => {
    if (!logText) return [];

    const lines = logText.split('\n');
    const processedLines = lines.map((line, index) => {
      let processedLine = line;
      let className = "text-on-surface";
      let prefix = "";

      // Detectar números de turno
      const turnMatch = line.match(/^Turn (\d+)/i);
      if (turnMatch) {
        className = "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded";
        prefix = "🔄 ";
      }

      // Detectar acciones de jugadores
      if (line.includes(`${player1} `) || line.startsWith(`${player1}:`)) {
        className = "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-l";
        prefix = "🔵 ";
      } else if (line.includes(`${player2} `) || line.startsWith(`${player2}:`)) {
        className = "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-l";
        prefix = "🔴 ";
      }

      // Detectar cartas - patrones comunes
      const cardPatterns = [
        /plays? (.+?)(?:\s+from|\.|\s*$)/i,
        /attaches? (.+?)(?:\s+to|\.|\s*$)/i,
        /uses? (.+?)(?:\s+to|\.|\s*$)/i,
        /draws? (.+?)(?:\s+card|\.|\s*$)/i,
        /discards? (.+?)(?:\s+card|\.|\s*$)/i,
        /\b([A-Z][a-z]+ ?(?:[A-Z][a-z]*)*(?:\s+ex|EX)?)\b/g, // Pokemon names
        /\b([A-Z][a-z]+(?: [A-Z][a-z]+)*)\s+(?:Card|Energy)\b/g // Card names
      ];

      // Resaltar cartas específicas
      cardPatterns.forEach(pattern => {
        processedLine = processedLine.replace(pattern, (match, cardName) => {
          if (cardName && cardName.length > 2) {
            // Diferentes colores para diferentes tipos de cartas
            let cardClass = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1 rounded font-medium";
            
            // Pokemon (nombres que terminan en ex, EX, etc.)
            if (/\b(ex|EX|GX|V|VMAX|VSTAR)\b/.test(cardName)) {
              cardClass = "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-1 rounded font-bold";
            }
            // Energía
            else if (/energy/i.test(cardName)) {
              cardClass = "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1 rounded";
            }
            // Trainer cards
            else if (/ball|search|rod|switch|professor|draw|discard/i.test(cardName)) {
              cardClass = "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 px-1 rounded";
            }

            return `<span class="${cardClass}">${cardName}</span>`;
          }
          return match;
        });
      });

      // Detectar eventos especiales
      if (/wins?|victory|defeat|concede/i.test(line)) {
        className = "text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-50 dark:bg-yellow-950/30 px-2 py-1 rounded";
        prefix = "👑 ";
      } else if (/damage/i.test(line)) {
        className = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-1";
        prefix = "💥 ";
      } else if (/heal/i.test(line)) {
        className = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-1";
        prefix = "💚 ";
      } else if (/prize/i.test(line)) {
        className = "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-1 font-medium";
        prefix = "🏆 ";
      }

      return {
        id: index,
        original: line,
        processed: processedLine,
        className,
        prefix,
        isEmpty: line.trim() === ""
      };
    });

    return processedLines;
  }, [logText, player1, player2]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
      <div className="font-mono text-sm space-y-1">
        {processedLog.map((line) => (
          <div key={line.id} className={`${line.className} ${line.isEmpty ? 'h-2' : ''}`}>
            {!line.isEmpty && (
              <>
                <span className="text-gray-400 mr-2">{line.prefix}</span>
                <span dangerouslySetInnerHTML={{ __html: line.processed }} />
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Leyenda de colores */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Leyenda de colores:</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Turnos</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>{player1}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>{player2}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Pokémon EX/GX</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Cartas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span>Trainer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Energía</span>
          </div>
        </div>
      </div>
    </div>
  );
}