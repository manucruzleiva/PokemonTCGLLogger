import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Home, BarChart3, FileText, User, Upload, LogOut, HelpCircle, BookOpen } from "lucide-react";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/matches", label: "Mis Partidas", icon: FileText },
  { href: "/upload", label: "Subir Partida", icon: Upload },
  { href: "/profile", label: "Perfil", icon: User },
];

interface DesktopNavigationProps {
  onAssistanceClick?: () => void;
  onHelpClick?: () => void;
}

export default function DesktopNavigation({ onAssistanceClick, onHelpClick }: DesktopNavigationProps) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (!isAuthenticated) {
    return null;
  }

  // Desktop navigation disabled - using hamburger menu only
  return null;
}