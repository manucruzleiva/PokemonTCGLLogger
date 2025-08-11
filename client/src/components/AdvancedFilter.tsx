import { useState } from "react";
import { Search, Filter, X, Calendar, User, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterOptions {
  searchTerm: string;
  playerName: string;
  winner: string;
  minTurns: string;
  maxTurns: string;
  dateRange: string;
  uploader: string;
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  playerNames: string[];
  uploaderNames: string[];
}

export default function AdvancedFilter({ 
  onFilterChange, 
  playerNames, 
  uploaderNames 
}: AdvancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    playerName: "",
    winner: "",
    minTurns: "",
    maxTurns: "",
    dateRange: "",
    uploader: ""
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      searchTerm: "",
      playerName: "",
      winner: "",
      minTurns: "",
      maxTurns: "",
      dateRange: "",
      uploader: ""
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value.trim() !== "").length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="mb-6">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avanzados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Búsqueda Avanzada
              </CardTitle>
              <CardDescription>
                Filtra las partidas por cualquier combinación de criterios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda general */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Búsqueda General
                </label>
                <Input
                  placeholder="Buscar en títulos, jugadores, Pokémon..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro por jugador */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Jugador
                  </label>
                  <Select value={filters.playerName} onValueChange={(value) => handleFilterChange("playerName", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier jugador</SelectItem>
                      {playerNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por ganador */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Ganador
                  </label>
                  <Select value={filters.winner} onValueChange={(value) => handleFilterChange("winner", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier ganador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier ganador</SelectItem>
                      {playerNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por uploader */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Subido por
                  </label>
                  <Select value={filters.uploader} onValueChange={(value) => handleFilterChange("uploader", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier usuario</SelectItem>
                      {uploaderNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtros de turnos */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Número de Turnos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Mín. turnos"
                    value={filters.minTurns}
                    onChange={(e) => handleFilterChange("minTurns", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Máx. turnos"
                    value={filters.maxTurns}
                    onChange={(e) => handleFilterChange("maxTurns", e.target.value)}
                  />
                </div>
              </div>

              {/* Filtro por fecha */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquier fecha</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="3months">Últimos 3 meses</SelectItem>
                    <SelectItem value="6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="year">Último año</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros activos */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value.trim()) return null;
                      
                      const labels: Record<string, string> = {
                        searchTerm: "Búsqueda",
                        playerName: "Jugador",
                        winner: "Ganador", 
                        minTurns: "Min. turnos",
                        maxTurns: "Max. turnos",
                        dateRange: "Período",
                        uploader: "Subido por"
                      };

                      return (
                        <Badge key={key} variant="secondary" className="gap-1">
                          {labels[key]}: {value}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleFilterChange(key as keyof FilterOptions, "")}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}