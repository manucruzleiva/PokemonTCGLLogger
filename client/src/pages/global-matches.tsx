import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Match } from "@shared/schema";
import MatchesList from "../components/MatchesList";
import MatchDetailModal from "../components/MatchDetailModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Search } from "lucide-react";

export default function GlobalMatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches/global"],
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
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Partidas</h1>
                <p className="text-sm text-muted-foreground">
                  Todas las partidas registradas en la plataforma
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MatchesList
          matches={matches}
          isLoading={isLoading}
          onMatchClick={handleMatchClick}
        />
      </div>

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditMatch}
      />
    </div>
  );
}