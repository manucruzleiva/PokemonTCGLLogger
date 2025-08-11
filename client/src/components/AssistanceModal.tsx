import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "./ObjectUploader";
import { HelpCircle, Camera, Send } from "lucide-react";
import type { UploadResult } from "@uppy/core";

const assistanceSchema = z.object({
  claimedName: z.string().min(1, "El nombre reclamado es requerido"),
  realName: z.string().min(1, "Tu nombre real es requerido"),
  description: z.string().min(10, "Describe la situación (mínimo 10 caracteres)"),
  evidenceImageUrl: z.string().optional(),
});

type AssistanceFormData = z.infer<typeof assistanceSchema>;

interface AssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictingName?: string;
}

export default function AssistanceModal({ isOpen, onClose, conflictingName }: AssistanceModalProps) {
  const { toast } = useToast();
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");

  const form = useForm<AssistanceFormData>({
    resolver: zodResolver(assistanceSchema),
    defaultValues: {
      claimedName: conflictingName || "",
      realName: "",
      description: "",
      evidenceImageUrl: "",
    },
  });

  const sendAssistanceMutation = useMutation({
    mutationFn: async (data: AssistanceFormData) => {
      const response = await apiRequest("POST", "/api/assistance", {
        ...data,
        evidenceImageUrl: evidenceUrl,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de asistencia ha sido enviada para revisión manual. Recibirás una respuesta por correo electrónico.",
      });
      form.reset();
      setEvidenceUploaded(false);
      setEvidenceUrl("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar solicitud",
        description: error.message || "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      if (uploadedFile.uploadURL) {
        setEvidenceUrl(uploadedFile.uploadURL);
        setEvidenceUploaded(true);
        toast({
          title: "Evidencia subida",
          description: "La imagen de evidencia se ha subido correctamente.",
        });
      }
    }
  };

  const handleSubmit = (data: AssistanceFormData) => {
    sendAssistanceMutation.mutate({
      ...data,
      evidenceImageUrl: evidenceUrl,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span>Solicitar Asistencia por Conflicto de Nombre</span>
          </DialogTitle>
          <DialogDescription>
            Si alguien está usando tu nombre de jugador sin autorización, envíanos los detalles 
            y evidencia para verificar tu identidad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="claimedName">Nombre que reclamas</Label>
              <Input
                id="claimedName"
                {...form.register("claimedName")}
                placeholder="El nombre de jugador que te pertenece"
                className="mt-1"
              />
              {form.formState.errors.claimedName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.claimedName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="realName">Tu nombre real</Label>
              <Input
                id="realName"
                {...form.register("realName")}
                placeholder="Tu nombre real para verificación"
                className="mt-1"
              />
              {form.formState.errors.realName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.realName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción de la situación</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Explica por qué este nombre te pertenece y cualquier información adicional relevante..."
                rows={4}
                className="mt-1"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label>Evidencia (imagen)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Sube una imagen que demuestre que eres el propietario legítimo del nombre de jugador
                (captura de pantalla del perfil, certificados, etc.)
              </p>
              
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={5 * 1024 * 1024} // 5MB
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName={evidenceUploaded ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>
                    {evidenceUploaded ? "Evidencia subida ✓" : "Subir evidencia"}
                  </span>
                </div>
              </ObjectUploader>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={sendAssistanceMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {sendAssistanceMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}