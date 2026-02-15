import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Dispensing from "./pages/Dispensing";
import Stock from "./pages/Stock";
import Customers from "./pages/Customers";
import Pricing from "./pages/Pricing";
import Insurance from "./pages/Insurance";
import MedicalAdvice from "./pages/MedicalAdvice";
import Reports from "./pages/Reports";
import Messages from "./pages/Messages";
import CalendarPage from "./pages/CalendarPage";
import Stores from "./pages/Stores";
import SettingsPage from "./pages/SettingsPage";
import Auth from "./pages/Auth";
import AdminValidation from "./pages/AdminValidation";
import UserManagement from "./pages/UserManagement";
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
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/dispensing" element={<Dispensing />} />
                      <Route path="/stock" element={<Stock />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/insurance" element={<Insurance />} />
                      <Route path="/medical-advice" element={<MedicalAdvice />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/stores" element={<Stores />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/admin/validation" element={<AdminValidation />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
