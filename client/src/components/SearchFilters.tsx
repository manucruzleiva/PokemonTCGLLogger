import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchFilters({ searchQuery, onSearchChange }: SearchFiltersProps) {
  const [filterWinner, setFilterWinner] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-outline p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Buscar por jugador, Pokémon o número de partida..."
              />
            </div>
          </div>
          <div>
            <Select value={filterWinner} onValueChange={setFilterWinner}>
              <SelectTrigger className="w-full py-3 border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <SelectValue placeholder="Todos los ganadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los ganadores</SelectItem>
                <SelectItem value="ArchShiero">ArchShiero</SelectItem>
                <SelectItem value="sreyasy93">sreyasy93</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full py-3 border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más reciente</SelectItem>
                <SelectItem value="oldest">Más antiguo</SelectItem>
                <SelectItem value="player1">Jugador 1 A-Z</SelectItem>
                <SelectItem value="player2">Jugador 2 A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
