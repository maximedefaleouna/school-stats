import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppStoreImpl, AppStoreProvider } from "@/hooks/useAppStore";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Personnel from "./pages/Personnel";
import Effectifs from "./pages/Effectifs";
import Statistiques from "./pages/Statistiques";
import Parametres from "./pages/Parametres";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppInner() {
  const store = useAppStoreImpl();
  return (
    <AppStoreProvider value={store}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/personnel" element={<Personnel />} />
            <Route path="/effectifs" element={<Effectifs />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/parametres" element={<Parametres />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppStoreProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
