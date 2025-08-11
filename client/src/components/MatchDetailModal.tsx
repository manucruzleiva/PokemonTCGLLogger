import { X, FileText, Users, Trophy, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ColorCodedMatchLog from "./ColorCodedMatchLog";
import type { Match } from "@shared/schema";

interface MatchDetailModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (match: Match) => void;
}

export default function MatchDetailModal({ match, isOpen, onClose, onEdit }: MatchDetailModalProps) {
  const { toast } = useToast();
  
  // Early return if no match
  if (!match) return null;

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatUploadDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportRawText = async () => {
    try {
      await navigator.clipboard.writeText(match.fullLog);
      toast({
        title: "Texto exportado",
        description: "El log completo de la partida se ha copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo copiar el texto al portapapeles.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-outline pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-medium text-on-surface">
              Detalles de la Partida
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="log" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Log Completo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Título</label>
                    <p className="text-on-surface">{match.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Ganador</label>
                    <p className="text-success font-medium">{match.winner}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Duración</label>
                    <p className="text-on-surface">{match.turns} turnos</p>
                  </div>
                  {match.uploader && (
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">Subido por</label>
                      <p className="text-on-surface">{match.uploader}</p>
                    </div>
                  )}
                  {(match.player1Prizes > 0 || match.player2Prizes > 0) && (
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">Premios obtenidos</label>
                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm">
                          <Trophy className="w-3 h-3 mr-1" />
                          {match.player1}: {match.player1Prizes}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm">
                          <Trophy className="w-3 h-3 mr-1" />
                          {match.player2}: {match.player2Prizes}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha de subida</label>
                    <p className="text-on-surface">{formatUploadDate(match.uploadedAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Tamaño del archivo</label>
                    <p className="text-on-surface">{formatFileSize(match.fileSize)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">ID de partida</label>
                    <p className="text-on-surface font-mono text-sm">#{match.id}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">
                    Pokémon de {match.player1}
                  </label>
                  <div className="space-y-1">
                    {match.player1Pokemon.map((pokemon, index) => (
                      <span key={index} className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm mr-2 mb-1">
                        {pokemon}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">
                    Pokémon de {match.player2}
                  </label>
                  <div className="space-y-1">
                    {match.player2Pokemon.map((pokemon, index) => (
                      <span key={index} className="inline-block bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-sm mr-2 mb-1">
                        {pokemon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {match.notes && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Notas</label>
                  <p className="text-on-surface bg-surface-variant rounded-lg p-3">{match.notes}</p>
                </div>
              )}

              {match.tags && match.tags.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Tags</label>
                  <div className="space-y-1">
                    {match.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-accent/10 text-accent px-2 py-1 rounded text-sm mr-2 mb-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="log" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <FileText className="w-5 h-5" />
                    <h3 className="text-lg font-medium">Log completo de la partida</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportRawText}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Exportar texto
                  </Button>
                </div>
                <ColorCodedMatchLog 
                  logText={match.fullLog} 
                  player1={match.player1} 
                  player2={match.player2}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-6 border-t border-outline bg-surface">
          <div className="flex justify-end space-x-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}