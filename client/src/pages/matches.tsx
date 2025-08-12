import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Match } from "@shared/schema";
import MatchesList from "../components/MatchesList";
import MatchDetailModal from "../components/MatchDetailModal";
import MatchUploader from "../components/MatchUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Upload } from "lucide-react";

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isUploadPage = location === "/upload";

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const handleEditMatch = (match: Match) => {
    // Edit functionality can be implemented here if needed
    console.log("Edit match:", match);
  };



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                {isUploadPage ? <Upload className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  {isUploadPage ? "Subir Partida" : "Mis Partidas"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isUploadPage 
                    ? "Sube tus logs de partidas de Pokémon TCG Live"
                    : "Partidas donde has participado como jugador"
                  }
                </p>
              </div>
            </div>
            {matches.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Search className="w-4 h-4" />
                <span>{matches.length} partida{matches.length !== 1 ? 's' : ''} encontrada{matches.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {isUploadPage ? (
          <div className="space-y-8">
            <MatchUploader />
            
            {/* Últimas 3 partidas subidas por el usuario */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Tus Últimas Partidas</h3>
              {matches.length === 0 ? (
                <Card className="max-w-md mx-auto">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      No tienes partidas subidas aún. ¡Sube tu primera partida arriba!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {matches.slice(0, 3).map((match) => (
                    <Card key={match.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleMatchClick(match)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-foreground">
                              {match.player1} vs {match.player2}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Ganador: {match.winner} • {match.turns} turnos
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Condición: {match.winCondition}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(match.uploadedAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {matches.length === 0 && !isLoading ? (
              <Card className="max-w-md mx-auto mt-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Sin partidas
                  </CardTitle>
                  <CardDescription>
                    No tienes partidas registradas aún.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Las partidas donde aparezca tu nombre se mostrarán aquí automáticamente cuando sean subidas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <MatchesList
                matches={matches}
                isLoading={isLoading}
                onMatchClick={handleMatchClick}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de detalles de partida */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditMatch}
      />
    </div>
  );
}