import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Home from "./pages/home";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import VisualStatsPage from "./pages/visual-stats";
import SimpleStatsPage from "./pages/simple-stats";
import StatisticsPage from "./pages/statistics";
import StatsPage from "./pages/stats";
import MatchesPage from "./pages/matches";
import GlobalMatchesPage from "./pages/global-matches";
import NotFound from "./pages/not-found";
import PokemonReport from "./pages/PokemonReport";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <AppLayout>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/statistics" component={StatisticsPage} />
            <Route path="/stats" component={StatsPage} />
            <Route path="/matches" component={MatchesPage} />
            <Route path="/global-matches" component={GlobalMatchesPage} />
            <Route path="/upload" component={MatchesPage} />
            <Route path="/profile" component={Profile} />
            <Route path="/pokemon" component={PokemonReport} />
            <Route path="/test" component={SimpleStatsPage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
