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
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-2xl font-bold text-primary mb-2">
            Cyber Wolf Chat
          </div>
          <div className="text-text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!user ? (
        <>
          <Route path="/" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
        </>
      ) : user.isNewUser ? (
        <Route path="*" component={SetupProfilePage} />
      ) : (
        <Route path="*" component={ChatPage} />
      )}
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
