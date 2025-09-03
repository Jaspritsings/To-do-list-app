import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { LocalStorage } from "@/lib/storage";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const onboardingCompleted = LocalStorage.getOnboardingCompleted();
    setShowOnboarding(!onboardingCompleted);
  }, []);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  if (showOnboarding) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background flex" data-testid="app">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      
      <main className="flex-1 flex flex-col min-h-screen">
        <Switch>
          <Route path="/" component={() => <Home onMenuClick={handleMenuClick} />} />
          <Route path="/today" component={() => <Home onMenuClick={handleMenuClick} />} />
          <Route path="/overdue" component={() => <Home onMenuClick={handleMenuClick} />} />
          <Route path="/upcoming" component={() => <Home onMenuClick={handleMenuClick} />} />
          <Route path="/projects" component={() => <Home onMenuClick={handleMenuClick} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
