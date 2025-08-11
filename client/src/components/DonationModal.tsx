
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, ExternalLink, Coffee, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {

  const donationOptions = [
    { amount: "$3", description: "Café ☕", color: "bg-amber-500" },
    { amount: "$5", description: "Apoyo básico 🌟", color: "bg-blue-500" },
    { amount: "$10", description: "Gran ayuda 🚀", color: "bg-green-500" },
    { amount: "$25", description: "Súper apoyo 💎", color: "bg-purple-500" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Apoya el Proyecto
          </DialogTitle>
          <DialogDescription>
            Esta aplicación tiene costos mensuales de servidor, base de datos y APIs. 
            Tu donación ayuda a mantener el servicio funcionando para toda la comunidad.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {donationOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex flex-col gap-1"
                onClick={() => {
                  // Integración con PayPal - reemplazar con tu link real
                  window.open(`https://www.paypal.com/donate/?hosted_button_id=YOUR_BUTTON_ID&amount=${option.amount.replace('$', '')}`, '_blank');
                }}
              >
                <div className={`w-8 h-8 ${option.color} rounded-full flex items-center justify-center`}>
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">{option.amount}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Button>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm">Costos Mensuales del Proyecto:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>• Base de datos PostgreSQL</span>
                <Badge variant="secondary">$5/mes</Badge>
              </div>
              <div className="flex justify-between">
                <span>• Hosting y servidor</span>
                <Badge variant="secondary">$10/mes</Badge>
              </div>
              <div className="flex justify-between">
                <span>• APIs Pokemon TCG</span>
                <Badge variant="secondary">$3/mes</Badge>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-1 border-t">
                <span>Total mensual:</span>
                <Badge>$18/mes</Badge>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Cualquier cantidad es muy apreciada. ¡Gracias por tu apoyo! 💚
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                window.open('https://www.paypal.com/donate/?hosted_button_id=YOUR_BUTTON_ID', '_blank');
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Donar con PayPal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}