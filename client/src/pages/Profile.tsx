import { useState } from "react";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Settings, LogOut, FileText, HelpCircle } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import AssistanceModal from "@/components/AssistanceModal";
import { Link } from "wouter";

const profileSchema = z.object({
  playerName: z.string().min(1, "El nombre de jugador es obligatorio").max(50, "El nombre de jugador no puede exceder 50 caracteres").trim(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [conflictingName, setConflictingName] = useState<string>("");

  const typedUser = user as UserType | undefined;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      playerName: typedUser?.playerName || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      console.log("Sending profile update:", data);
      return await apiRequest("PATCH", "/api/auth/profile", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      console.log("Profile update successful:", data);
      toast({
        title: "Perfil actualizado",
        description: "Tu nombre de jugador ha sido actualizado exitosamente.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      
      // Check if it's a name conflict error
      if (error.message?.includes("409:") && error.message?.includes("conflictingName")) {
        try {
          const errorData = JSON.parse(error.message.split("409: ")[1]);
          setConflictingName(errorData.conflictingName || "");
          setShowAssistanceModal(true);
        } catch {
          // Fallback if parsing fails
          setConflictingName("");
          setShowAssistanceModal(true);
        }
      } else {
        toast({
          title: "Error al actualizar",
          description: error.message || "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSave = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset({ playerName: typedUser?.playerName || "" });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!typedUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No se pudo cargar la información del usuario.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-on-surface">Mi Perfil</h1>
              <p className="text-on-surface-variant">Gestiona tu información personal</p>
            </div>
          </div>
          
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/api/logout'}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Información de la Cuenta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={typedUser.email || "No disponible"} 
                    disabled 
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Fecha de registro</Label>
                <Input 
                  value={typedUser.createdAt ? new Date(typedUser.createdAt).toLocaleDateString('es-ES') : "No disponible"} 
                  disabled 
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pokemon TCG Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Juego</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <div>
                  <Label htmlFor="playerName">Nombre de Jugador</Label>
                  <p className="text-sm text-on-surface-variant mb-2">
                    Este es el nombre que usas en Pokemon TCG Online/Live. Es obligatorio para usar la aplicación.
                  </p>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        id="playerName"
                        {...form.register("playerName")}
                        placeholder="Introduce tu nombre de jugador"
                        className="mt-1"
                      />
                      {form.formState.errors.playerName && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.playerName.message}
                        </p>
                      )}
                      <div className="flex space-x-2">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                          size="sm"
                        >
                          {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancel}
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Input 
                          value={typedUser.playerName || "No configurado"} 
                          disabled 
                          className="mt-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(true)}
                          size="sm"
                        >
                          {typedUser.playerName ? "Editar" : "Configurar"}
                        </Button>
                      </div>
                      {!typedUser.playerName && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Nombre requerido:</strong> Debes configurar tu nombre de jugador para poder usar todas las funciones de la aplicación.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          
        </div>

        {/* Assistance Modal */}
        <AssistanceModal
          isOpen={showAssistanceModal}
          onClose={() => setShowAssistanceModal(false)}
          conflictingName={conflictingName}
        />
      </div>
    </div>
  );
}