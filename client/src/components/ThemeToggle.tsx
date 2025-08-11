import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="text-on-surface-variant hover:text-on-surface transition-all duration-200 hover:bg-surface-variant"
      title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
      )}
    </Button>
  );
}