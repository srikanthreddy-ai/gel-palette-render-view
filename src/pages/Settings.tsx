
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [rolePermissions, setRolePermissions] = useState({
    admin: ['dashboard', 'incentives', 'staff', 'reports', 'master_data', 'settings'],
    manager: ['dashboard', 'incentives', 'staff', 'reports'],
    user: ['dashboard', 'incentives'],
    hr: ['dashboard', 'staff', 'master_data']
  });

  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });

  const modules = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'incentives', label: 'Incentives' },
    { id: 'staff', label: 'Staff Management' },
    { id: 'reports', label: 'Reports' },
    { id: 'master_data', label: 'Master Data' },
    { id: 'settings', label: 'Settings' }
  ];

  const roles = ['admin', 'manager', 'user', 'hr'];

  useEffect(() => {
    const storedPermissions = localStorage.getItem('rolePermissions');
    if (storedPermissions) {
      setRolePermissions(JSON.parse(storedPermissions));
    }
  }, []);

  const handlePermissionChange = (role: string, module: string, checked: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: checked 
        ? [...prev[role as keyof typeof prev], module]
        : prev[role as keyof typeof prev].filter(m => m !== module)
    }));
  };

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    setWorkingDays(prev => ({
      ...prev,
      [day]: checked
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
    localStorage.setItem('workingDays', JSON.stringify(workingDays));
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">GENERAL</TabsTrigger>
          <TabsTrigger value="timesheet">TIMESHEET</TabsTrigger>
          <TabsTrigger value="payroll">PAYROLL</TabsTrigger>
          <TabsTrigger value="notifications">NOTIFICATIONS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roles.map(role => (
                  <div key={role} className="space-y-3">
                    <h3 className="text-lg font-semibold capitalize">{role} Role</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {modules.map(module => (
                        <div key={module.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${role}-${module.id}`}
                            checked={rolePermissions[role as keyof typeof rolePermissions]?.includes(module.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(role, module.id, checked as boolean)
                            }
                          />
                          <label htmlFor={`${role}-${module.id}`} className="text-sm">
                            {module.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Default Department</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Enter default department" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timesheet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(workingDays).map(([day, checked]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={checked}
                      onCheckedChange={(checked) => 
                        handleWorkingDayChange(day, checked as boolean)
                      }
                    />
                    <label htmlFor={day} className="text-sm capitalize">
                      {day.slice(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Payroll configuration options will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Notification preferences will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
