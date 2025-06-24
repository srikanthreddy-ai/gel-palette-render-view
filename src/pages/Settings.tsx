import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Edit, UserPlus } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

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

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      role: 'admin',
      permissions: ['dashboard', 'incentives', 'staff', 'reports', 'master_data', 'settings'],
      createdAt: '2024-01-01',
      status: 'active'
    },
    {
      id: '2',
      username: 'manager1',
      email: 'manager@company.com',
      role: 'manager',
      permissions: ['dashboard', 'incentives', 'staff', 'reports'],
      createdAt: '2024-01-15',
      status: 'active'
    }
  ]);

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: '',
      permissions: [] as string[]
    }
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

    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
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

  const handleRoleChange = (role: string) => {
    const defaultPermissions = rolePermissions[role as keyof typeof rolePermissions] || [];
    form.setValue('permissions', defaultPermissions);
  };

  const handleUserPermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = form.getValues('permissions');
    const newPermissions = checked
      ? [...currentPermissions, permission]
      : currentPermissions.filter(p => p !== permission);
    form.setValue('permissions', newPermissions);
  };

  const onSubmitUser = (data: any) => {
    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...data, id: editingUser.id, createdAt: editingUser.createdAt }
          : user
      ));
      toast({
        title: "User updated",
        description: "User has been updated successfully.",
      });
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active' as const
      };
      setUsers(prev => [...prev, newUser]);
      toast({
        title: "User created",
        description: "New user has been created successfully.",
      });
    }
    
    setIsUserDialogOpen(false);
    setEditingUser(null);
    form.reset();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      permissions: user.permissions
    });
    setIsUserDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.reset({
      username: '',
      email: '',
      password: '',
      role: '',
      permissions: []
    });
    setIsUserDialogOpen(true);
  };

  const saveSettings = () => {
    localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
    localStorage.setItem('workingDays', JSON.stringify(workingDays));
    localStorage.setItem('users', JSON.stringify(users));
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const selectedRole = form.watch('role');
  const selectedPermissions = form.watch('permissions') || [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">GENERAL</TabsTrigger>
          <TabsTrigger value="timesheet">TIMESHEET</TabsTrigger>
          <TabsTrigger value="payroll">PAYROLL</TabsTrigger>
          <TabsTrigger value="notifications">NOTIFICATIONS</TabsTrigger>
          <TabsTrigger value="users">USER MANAGEMENT</TabsTrigger>
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

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitUser)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password {editingUser && '(leave blank to keep current)'}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Select onValueChange={(value) => {
                                field.onChange(value);
                                handleRoleChange(value);
                              }} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {selectedRole && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Permissions</label>
                          <div className="grid grid-cols-1 gap-2">
                            {modules.map((module) => (
                              <div key={module.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`user-${module.id}`}
                                  checked={selectedPermissions.includes(module.id)}
                                  onCheckedChange={(checked) => 
                                    handleUserPermissionChange(module.id, checked as boolean)
                                  }
                                />
                                <label htmlFor={`user-${module.id}`} className="text-sm">
                                  {module.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          {editingUser ? 'Update' : 'Create'} User
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
