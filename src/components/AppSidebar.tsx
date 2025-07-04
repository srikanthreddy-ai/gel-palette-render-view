
import React from 'react';
import { Home, FileText, Users, BarChart3, Database, Settings, LogOut, ChevronDown } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar = () => {
  const navigate = useNavigate();
  const { user, hasAccess, logout } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      url: "/dashboard",
      module: "dashboard"
    },
    {
      title: "Incentives",
      icon: FileText,
      url: "#",
      module: "incentives",
      subItems: [
        { title: "Incentive Entry", url: "/incentives/add" },
        { title: "Allowance Entry", url: "/incentives/add-allowance" },
        { title: "Add General Incentive", url: "/incentives/add-general" },
        { title: "View Allowance", url: "/incentives/view-allowance" }
      ]
    },
    {
      title: "Staff Management",
      icon: Users,
      url: "/staff",
      module: "staff"
    },
    {
      title: "Users",
      icon: Users,
      url: "/users",
      module: "users"
    },
    {
      title: "Reports",
      icon: BarChart3,
      url: "/reports",
      module: "reports"
    },
    {
      title: "Payroll",
      icon: FileText,
      url: "/payroll",
      module: "payroll"
    },
    {
      title: "Master Data",
      icon: Database,
      url: "#",
      module: "master_data",
      subItems: [
        { title: "Building Master", url: "/master/building" },
        { title: "Norms Master", url: "/master/norms" },
        { title: "Shift Master", url: "/master/shift" },
        { title: "Allowance Master", url: "/master/allowance" },
        { title: "Bulk Upload", url: "/master/bulk-upload" }
      ]
    }
  ];

  const handleNavigation = (url: string) => {
    if (url !== '#') {
      navigate(url);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="bg-gray-800 text-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (!hasAccess(item.module)) return null;
                
                if (item.subItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between hover:bg-gray-700">
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  onClick={() => handleNavigation(subItem.url)}
                                  className="hover:bg-gray-700 text-white"
                                >
                                  {subItem.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.url)}
                      className="hover:bg-gray-700"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {hasAccess('settings') && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('/settings')}
                    className="hover:bg-gray-700"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="hover:bg-gray-700"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
