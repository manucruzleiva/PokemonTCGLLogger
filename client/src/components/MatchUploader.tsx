import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BattleLoadingScreen from "./BattleLoadingScreen";

export default function MatchUploader() {
  const [logText, setLogText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (logData: string) => {
      const response = await apiRequest("POST", "/api/matches", { logText: logData });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Partida subida exitosamente!",
        description: "La partida ha sido procesada y almacenada en la base de datos.",
      });
      setLogText("");
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al subir partida",
        description: error.message || "Ocurrió un error al procesar la partida.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!logText.trim()) {
      toast({
        title: "Texto requerido",
        description: "Por favor ingresa el log de la partida.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(logText);
  };

  const handleClear = () => {
    setLogText("");
  };

  // Show battle loading screen during upload
  if (uploadMutation.isPending) {
    return <BattleLoadingScreen 
      message="Procesando partida" 
      submessage="Analizando movimientos y estadísticas" 
      progress={75} 
    />;
  }

  return (
    <section className="mb-8">
      <div className="bg-white dark:bg-surface rounded-xl shadow-sm border border-outline p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-medium text-on-surface mb-2">Agregar Partida al Repositorio</h2>
          <p className="text-on-surface-variant">Pega el log completo de tu partida de Pokémon TCG Live</p>
        </div>
        
        {/* Text Input Area */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <label className="block text-sm font-medium text-on-surface">
              Pega el log de la partida:
            </label>
          </div>
          <Textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            className="w-full h-48 p-4 border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Pega aquí el log completo de la partida de Pokémon..."
          />
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploadMutation.isPending}
              className="bg-primary hover:bg-primary-dark text-white font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Procesar Partida
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}