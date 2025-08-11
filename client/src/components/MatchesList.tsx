import { useState, useMemo } from "react";
import { Eye, Copy, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Match } from "@shared/schema";
import AdvancedFilter from "./AdvancedFilter";

interface MatchesListProps {
  matches: Match[];
  isLoading: boolean;
  onMatchClick?: (match: Match) => void;
}

interface FilterOptions {
  searchTerm: string;
  playerName: string;
  winner: string;
  minTurns: string;
  maxTurns: string;
  dateRange: string;
  uploader: string;
}

export default function MatchesList({ 
  matches, 
  isLoading,
  onMatchClick
}: MatchesListProps) {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    playerName: "",
    winner: "",
    minTurns: "",
    maxTurns: "",
    dateRange: "",
    uploader: ""
  });

  // Extract unique player names and uploaders for filter options
  const playerNames = useMemo(() => {
    const names = new Set<string>();
    matches.forEach(match => {
      names.add(match.player1);
      names.add(match.player2);
    });
    return Array.from(names).sort();
  }, [matches]);

  const uploaderNames = useMemo(() => {
    const names = new Set<string>();
    matches.forEach(match => {
      if (match.uploader) names.add(match.uploader);
    });
    return Array.from(names).sort();
  }, [matches]);

  // Filter matches based on current filters
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          match.title.toLowerCase().includes(searchLower) ||
          match.player1.toLowerCase().includes(searchLower) ||
          match.player2.toLowerCase().includes(searchLower) ||
          match.player1Pokemon.some(p => p.toLowerCase().includes(searchLower)) ||
          match.player2Pokemon.some(p => p.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Player name filter
      if (filters.playerName && 
          match.player1 !== filters.playerName && 
          match.player2 !== filters.playerName) {
        return false;
      }

      // Winner filter
      if (filters.winner && match.winner !== filters.winner) {
        return false;
      }

      // Uploader filter
      if (filters.uploader && match.uploader !== filters.uploader) {
        return false;
      }

      // Turns filter
      if (filters.minTurns && match.turns < parseInt(filters.minTurns)) {
        return false;
      }
      if (filters.maxTurns && match.turns > parseInt(filters.maxTurns)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const matchDate = new Date(match.uploadedAt);
        const now = new Date();
        let cutoffDate: Date;

        switch (filters.dateRange) {
          case "today":
            cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "3months":
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case "6months":
            cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            break;
          case "year":
            cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(0);
        }

        if (matchDate < cutoffDate) {
          return false;
        }
      }

      return true;
    });
  }, [matches, filters]);
  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatUploadDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: es 
    });
  };

  const handleExportMatch = async (match: Match) => {
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

  if (isLoading) {
    return (
      <section>
        <AdvancedFilter 
          onFilterChange={setFilters}
          playerNames={playerNames}
          uploaderNames={uploaderNames}
        />
        <div className="bg-white rounded-xl shadow-sm border border-outline">
          <div className="p-6 border-b border-outline">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-on-surface">Historial de Partidas</h3>
              <span className="text-sm text-on-surface-variant">Cargando...</span>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-on-surface-variant mt-2">Cargando partidas...</p>
          </div>
        </div>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section>
        <AdvancedFilter 
          onFilterChange={setFilters}
          playerNames={playerNames}
          uploaderNames={uploaderNames}
        />
        <div className="bg-white rounded-xl shadow-sm border border-outline">
          <div className="p-6 border-b border-outline">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-on-surface">Historial de Partidas</h3>
              <span className="text-sm text-on-surface-variant">0 partidas</span>
            </div>
          </div>
          <div className="p-8 text-center">
            <p className="text-on-surface-variant">No se encontraron partidas. ¡Sube tu primera partida!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <AdvancedFilter 
        onFilterChange={setFilters}
        playerNames={playerNames}
        uploaderNames={uploaderNames}
      />
      <div className="bg-white dark:bg-surface rounded-xl shadow-sm border border-outline">
        <div className="p-6 border-b border-outline">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-on-surface">Historial de Partidas</h3>
            <span className="text-sm text-on-surface-variant">
              {filteredMatches.length} de {matches.length} partidas
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-outline">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-on-surface-variant mb-2">No se encontraron partidas con los filtros aplicados</p>
              <p className="text-sm text-on-surface-variant">Intenta ajustar los criterios de búsqueda</p>
            </div>
          ) : (
            filteredMatches.map((match) => (
            <div key={match.id} className="p-6 hover:bg-surface-variant transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h4 className="text-lg font-medium text-on-surface">
                      {match.title}
                    </h4>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        <Trophy className="w-3 h-3 mr-1" />
                        {match.winner}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Clock className="w-3 h-3 mr-1" />
                        {match.turns} turnos
                      </span>
                      {(match.player1Prizes > 0 || match.player2Prizes > 0) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                          Premios: {match.player1Prizes}-{match.player2Prizes}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Jugador 1</p>
                      <p className="text-sm font-medium text-on-surface">{match.player1}</p>
                      <p className="text-xs text-on-surface-variant">
                        {match.player1Pokemon.slice(0, 3).join(", ")}
                        {match.player1Pokemon.length > 3 && "..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Jugador 2</p>
                      <p className="text-sm font-medium text-on-surface">{match.player2}</p>
                      <p className="text-xs text-on-surface-variant">
                        {match.player2Pokemon.slice(0, 3).join(", ")}
                        {match.player2Pokemon.length > 3 && "..."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-on-surface-variant">
                    <span>{formatUploadDate(match.uploadedAt)}</span>
                    <span>•</span>
                    <span>{formatFileSize(match.fileSize)}</span>
                    {match.uploader && (
                      <>
                        <span>•</span>
                        <span>Por: {match.uploader}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                    onClick={() => onMatchClick?.(match)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Detalles
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-on-surface-variant hover:bg-surface-variant"
                    onClick={() => handleExportMatch(match)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </section>
  );
}
