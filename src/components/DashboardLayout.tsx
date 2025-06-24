
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-gradient-to-r from-orange-400 to-pink-500 px-4">
            <SidebarTrigger className="text-white hover:bg-white/20" />
            <div className="flex-1 flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">Premier Explosives Limited</h1>
              {user && (
                <div className="flex items-center space-x-2 text-white">
                  <span className="text-sm">{user.username}</span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{user.username[0].toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
