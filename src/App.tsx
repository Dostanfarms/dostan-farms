
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
import FarmerTicketHistory from "./pages/FarmerTicketHistory";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Employees from "./pages/Employees";
import Roles from "./pages/Roles";
import EmployeeLogin from "./pages/EmployeeLogin";
import Transactions from "./pages/Transactions";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";
import Coupons from "./pages/Coupons";
import AppLanding from "./pages/AppLanding";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerProfile from "./pages/CustomerProfile";
import OrderHistory from "./pages/OrderHistory";
import CustomerHome from "./pages/CustomerHome";
import CustomerTicketHistory from "./pages/CustomerTicketHistory";
import PaymentPage from "./pages/PaymentPage";
import OrderTracking from "./pages/OrderTracking";
import CartPage from "./pages/CartPage";
import OrderReceiptPage from "./pages/OrderReceiptPage";
import Tickets from "./pages/Tickets";
import Customers from "./pages/Customers";

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
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/app-landing" element={<AppLanding />} />
            <Route path="/" element={<AppLanding />} />
            <Route path="/customer-login" element={<CustomerLogin />} />
            <Route path="/customer-register" element={<CustomerRegister />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute resource="dashboard" action="view" />}>
              <Route path="/dashboard" element={<Index />} />
            </Route>
            
            <Route element={<ProtectedRoute resource="farmers" action="view" />}>
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/farmer/:id" element={<FarmerDetails />} />
            </Route>
            
            <Route element={<ProtectedRoute resource="customers" action="view" />}>
              <Route path="/customers" element={<Customers />} />
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
            
            {/* Removed ProtectedRoute for Coupons to allow all roles access */}
            <Route path="/coupons" element={<Coupons />} />
            
            <Route element={<ProtectedRoute resource="employees" action="view" />}>
              <Route path="/employees" element={<Employees />} />
            </Route>

            <Route element={<ProtectedRoute resource="roles" action="view" />}>
              <Route path="/roles" element={<Roles />} />
            </Route>
            
            {/* Added route for tickets */}
            <Route path="/tickets" element={<Tickets />} />
            
            {/* Farmer dashboard - separate auth system */}
            <Route path="/farmer-dashboard/:id" element={<FarmerDashboard />} />
            <Route path="/farmer-ticket-history/:id" element={<FarmerTicketHistory />} />
            
            {/* Customer routes */}
            <Route path="/customer-profile" element={<CustomerProfile />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/customer-home" element={<CustomerHome />} />
            <Route path="/ticket-history" element={<CustomerTicketHistory />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-receipt/:id" element={<OrderReceiptPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
