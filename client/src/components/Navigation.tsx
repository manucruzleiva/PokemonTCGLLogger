import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Upload, User, BarChart3, Archive } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: BarChart3, label: "Estadísticas" },
    { href: "/upload", icon: Upload, label: "Subir Partida" },
    { href: "/pokemon", icon: Archive, label: "Pokémon" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/">
            <div className="mr-6 flex items-center space-x-2">
              <div className="font-bold">TCG Match Logger</div>
            </div>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}