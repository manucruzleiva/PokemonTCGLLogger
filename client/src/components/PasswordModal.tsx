import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PasswordModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export default function PasswordModal({ isOpen, onVerified, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("POST", "/api/verify-password", { password });
      return response.json();
    },
    onSuccess: () => {
      setPassword("");
      onVerified();
    },
    onError: (error: any) => {
      toast({
        title: "Contraseña incorrecta",
        description: "La contraseña ingresada no es válida.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!password.trim()) {
      toast({
        title: "Contraseña requerida",
        description: "Por favor ingresa la contraseña administrativa.",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate(password);
  };

  const handleCancel = () => {
    setPassword("");
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b border-outline pb-4">
          <DialogTitle className="text-xl font-medium text-on-surface">
            Verificación de Contraseña
          </DialogTitle>
          <p className="text-sm text-on-surface-variant">
            Esta acción requiere autenticación administrativa
          </p>
        </DialogHeader>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                Contraseña administrativa
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                className="w-full border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingresa la contraseña"
              />
            </div>
            
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm text-warning font-medium">Contraseña administrativa</p>
                  <p className="text-xs text-warning/80 mt-1">
                    La contraseña se genera automáticamente al iniciar la aplicación y se muestra en la consola del servidor.
                  </p>
                </div>
              </div>
            </div>
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
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
              className="bg-primary hover:bg-primary-dark text-white font-medium"
            >
              {verifyMutation.isPending ? "Verificando..." : "Verificar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
