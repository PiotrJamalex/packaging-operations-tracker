
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import History from "./pages/History";
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";
import { OperationsProvider } from "@/context/OperationsContext";
import EmployeesManagement from "./pages/employees/EmployeesManagement";
import MachinesManagement from "./pages/machines/MachinesManagement";
import ProjectsManagement from "./pages/projects/ProjectsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" closeButton />
      <OperationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/historia" element={<History />} />
            <Route path="/analiza" element={<Analysis />} />
            <Route path="/zarzadzanie/pracownicy" element={<EmployeesManagement />} />
            <Route path="/zarzadzanie/maszyny" element={<MachinesManagement />} />
            <Route path="/zarzadzanie/projekty" element={<ProjectsManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OperationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
