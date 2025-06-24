
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import BulkUpload from "./pages/BulkUpload";
import StaffManagement from "./pages/StaffManagement";
import ProductionCategoryManagement from "./pages/ProductionCategoryManagement";
import NormsManagement from "./pages/NormsManagement";
import ShiftManagement from "./pages/ShiftManagement";
import AllowanceManagement from "./pages/AllowanceManagement";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StaffManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/production-category" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductionCategoryManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/master/building" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductionCategoryManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/master/norms" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NormsManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/master/shift" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ShiftManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/master/allowance" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllowanceManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/master/bulk-upload" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BulkUpload />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
