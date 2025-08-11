import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Home, BarChart3, FileText, User, Upload, LogOut, HelpCircle, BookOpen, Globe, Moon, Sun, Heart } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import type { User as UserType } from "@shared/schema";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/matches", label: "Mis Partidas", icon: FileText },
  { href: "/global-matches", label: "Partidas", icon: Globe },
  { href: "/upload", label: "Subir Partida", icon: Upload },
  { href: "/profile", label: "Perfil", icon: User },
];

interface MobileNavigationProps {
  onAssistanceClick?: () => void;
  onHelpClick?: () => void;
  onDonationClick?: () => void;
}

export default function MobileNavigation({ onAssistanceClick, onHelpClick, onDonationClick }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const typedUser = user as UserType | undefined;
  const hasPlayerName = typedUser?.playerName && typedUser.playerName.trim() !== '';
  
  // All users see all navigation items
  const getNavigationItems = () => {
    return navigationItems;
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    window.location.href = '/api/logout';
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleAssistance = () => {
    setIsOpen(false);
    onAssistanceClick?.();
  };

  const handleHelp = () => {
    setIsOpen(false);
    onHelpClick?.();
  };

  const handleDonation = () => {
    setIsOpen(false);
    onDonationClick?.();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 flex items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background border shadow-md mr-3">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle className="text-left">Navegación</SheetTitle>
            </SheetHeader>
          
          <nav className="flex flex-col space-y-3 mt-8">
            {getNavigationItems().map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={handleLinkClick}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            {/* Separator */}
            <div className="border-t my-4" />
            
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleThemeToggle}
            >
              {theme === "light" ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
            </Button>
            
            {/* Help Guide Button */}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleHelp}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Guía de Uso
            </Button>
            
            {/* Assistance Button */}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleAssistance}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Asistencia
            </Button>

            {/* Donation Button */}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleDonation}
            >
              <Heart className="mr-2 h-4 w-4" />
              Donación
            </Button>
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </nav>
          </SheetContent>
        </Sheet>
        <h1 className="font-bold text-lg text-primary">Pokémon Trainer Academia</h1>
      </div>
    </div>
  );
}