import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Match } from "@shared/schema";

interface DeleteConfirmationModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteConfirmationModal({ match, isOpen, onClose }: DeleteConfirmationModalProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (password: string) => {
      if (!match) throw new Error("No match selected");
      
      const response = await apiRequest("DELETE", `/api/matches/${match.id}`, { password });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Partida eliminada",
        description: "La partida ha sido eliminada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setPassword("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar",
        description: error.message || "Ocurrió un error al eliminar la partida.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (!password.trim()) {
      toast({
        title: "Contraseña requerida",
        description: "Por favor ingresa la contraseña administrativa para confirmar la eliminación.",
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate(password);
  };

  const handleCancel = () => {
    setPassword("");
    onClose();
  };

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

  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b border-outline pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <DialogTitle className="text-xl font-medium text-on-surface">
              Confirmar Eliminación
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          <p className="text-on-surface mb-4">
            ¿Estás seguro de que quieres eliminar esta partida? Esta acción no se puede deshacer.
          </p>
          <div className="bg-surface-variant rounded-lg p-4 mb-4">
            <p className="font-medium text-on-surface mb-1">{match.title}</p>
            <p className="text-sm text-on-surface-variant">
              {formatUploadDate(match.uploadedAt)} • {formatFileSize(match.fileSize)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">
              Contraseña administrativa
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              className="w-full"
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-outline bg-surface">
          <div className="flex justify-end space-x-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-on-surface-variant hover:text-on-surface"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-error hover:bg-error/90 text-white font-medium"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
