
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Farmers from "./pages/Farmers";
import FarmerDetails from "./pages/FarmerDetails";
import FarmerLogin from "./pages/FarmerLogin";
import FarmerDashboard from "./pages/FarmerDashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Employees from "./pages/Employees";
import Roles from "./pages/Roles";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeRegister from "./pages/EmployeeRegister";
import Transactions from "./pages/Transactions";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/farmer-login" element={<FarmerLogin />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/employee-register" element={<EmployeeRegister />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute resource="dashboard" action="view" />}>
              <Route path="/" element={<Index />} />
            </Route>
            
            <Route element={<ProtectedRoute resource="farmers" action="view" />}>
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/farmer/:id" element={<FarmerDetails />} />
            </Route>
            
            <Route element={<ProtectedRoute resource="products" action="view" />}>
              <Route path="/products" element={<Products />} />
            </Route>
            
            <Route element={<ProtectedRoute resource="sales" action="view" />}>
              <Route path="/sales" element={<Sales />} />
            </Route>
            
            <Route element={<ProtectedRoute resource="transactions" action="view" />}>
              <Route path="/transactions" element={<Transactions />} />
            </Route>

            <Route element={<ProtectedRoute resource="settlements" action="view" />}>
              <Route path="/settlements" element={<Transactions />} />
            </Route>
            
            <Route element={<ProtectedRoute resource="employees" action="view" />}>
              <Route path="/employees" element={<Employees />} />
            </Route>

            <Route element={<ProtectedRoute resource="roles" action="view" />}>
              <Route path="/roles" element={<Roles />} />
            </Route>
            
            {/* Farmer dashboard - separate auth system */}
            <Route path="/farmer-dashboard/:id" element={<FarmerDashboard />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
