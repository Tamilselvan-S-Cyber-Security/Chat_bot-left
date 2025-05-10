import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import SetupProfilePage from "@/pages/SetupProfilePage";
import ChatPage from "@/pages/ChatPage";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  // Directly render the login page to avoid loading issues
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/setup" component={SetupProfilePage} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
