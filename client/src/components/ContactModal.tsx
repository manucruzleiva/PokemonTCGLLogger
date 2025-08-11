import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, Loader2 } from "lucide-react";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      const response = await fetch('/api/contact/feature-request', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to send feature request');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de feature ha sido enviada exitosamente. Te responderemos pronto.",
      });
      setSubject("");
      setMessage("");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error sending feature request:', error);
      toast({
        title: "Error al enviar",
        description: "No pudimos enviar tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({ subject: subject.trim(), message: message.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Solicitar Nueva Feature
          </DialogTitle>
          <DialogDescription>
            Cuéntanos qué funcionalidad te gustaría ver en Pokemon TCG Match Logger. 
            Tu feedback es muy valioso para mejorar la aplicación.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              placeholder="Ej: Análisis de meta por formato, Exportar estadísticas..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Descripción detallada</Label>
            <Textarea
              id="message"
              placeholder="Describe la funcionalidad que te gustaría ver implementada. Incluye todos los detalles que consideres importantes..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending || !subject.trim() || !message.trim()}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}