import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Match } from "@shared/schema";

interface EditMatchModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditMatchModal({ match, isOpen, onClose }: EditMatchModalProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (match) {
      setTitle(match.title);
      setNotes(match.notes || "");
      setTags(match.tags || []);
    }
  }, [match]);

  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      if (!match) throw new Error("No match selected");
      
      // Note: We need to get the password from somewhere. 
      // This is a simplified implementation - in a real app, 
      // you might store the verified password temporarily or re-verify
      const password = prompt("Confirma la contraseña para guardar:");
      if (!password) throw new Error("Password required");

      const response = await apiRequest("PUT", `/api/matches/${match.id}`, {
        ...updateData,
        password
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Partida actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error al guardar los cambios.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      title: title.trim(),
      notes: notes.trim(),
      tags: tags.filter(tag => tag.trim().length > 0),
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-b border-outline pb-4">
          <DialogTitle className="text-xl font-medium text-on-surface">
            Editar Partida
          </DialogTitle>
          <p className="text-sm text-on-surface-variant">
            Modifica los detalles básicos de la partida
          </p>
        </DialogHeader>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Título de la partida
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Notas adicionales
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                placeholder="Agrega notas o comentarios sobre esta partida..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary hover:text-primary-dark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Agregar tag y presionar Enter"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-outline bg-surface">
          <div className="flex justify-end space-x-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary-dark text-white font-medium"
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
