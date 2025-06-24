
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import Login from '@/pages/Login';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import StaffManagement from '@/pages/StaffManagement';
import Users from '@/pages/Users';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import AllowanceManagement from '@/pages/AllowanceManagement';
import ProductionCategoryManagement from '@/pages/ProductionCategoryManagement';
import BulkUpload from '@/pages/BulkUpload';
import NormsManagement from '@/pages/NormsManagement';
import ShiftManagement from '@/pages/ShiftManagement';
import ProductionIncentiveEntry from '@/pages/ProductionIncentiveEntry';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/staff" element={<DashboardLayout><StaffManagement /></DashboardLayout>} />
            <Route path="/users" element={<DashboardLayout><Users /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/incentives/add" element={<DashboardLayout><ProductionIncentiveEntry /></DashboardLayout>} />
            <Route path="/incentives/add-allowance" element={<DashboardLayout><AllowanceManagement /></DashboardLayout>} />
            <Route path="/incentives/add-general" element={<DashboardLayout><ProductionCategoryManagement /></DashboardLayout>} />
            <Route path="/incentives/view-allowance" element={<DashboardLayout><AllowanceManagement /></DashboardLayout>} />
            <Route path="/master/building" element={<DashboardLayout><ProductionCategoryManagement /></DashboardLayout>} />
            <Route path="/master/norms" element={<DashboardLayout><NormsManagement /></DashboardLayout>} />
            <Route path="/master/shift" element={<DashboardLayout><ShiftManagement /></DashboardLayout>} />
            <Route path="/master/allowance" element={<DashboardLayout><AllowanceManagement /></DashboardLayout>} />
            <Route path="/master/bulk-upload" element={<DashboardLayout><BulkUpload /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
