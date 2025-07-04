import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Edit, UserPlus } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  privileges: string[];
  date: string;
  isActive: boolean;
  __v: number;
}

const Users = () => {
  const { toast } = useToast();
  const [rolePermissions, setRolePermissions] = useState({
    admin: ['dashboard', 'incentives', 'staff', 'reports', 'master_data', 'settings', 'users', 'payroll'],
    manager: ['dashboard', 'incentives', 'staff', 'reports', 'users', 'payroll'],
    hr: ['dashboard', 'staff', 'master_data', 'users', 'payroll'],
    supervisor: ['dashboard', 'incentives', 'staff']
  });

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    { id: 'users', label: 'Users' },
    { id: 'reports', label: 'Reports' },
    { id: 'master_data', label: 'Master Data' },
    { id: 'settings', label: 'Settings' },
    { id: 'payroll', label: 'Payroll' }
  ];

  const roles = ['admin', 'manager', 'hr', 'supervisor'];

  const fetchUsers = async () => {
    setIsLoading(true);
    console.log('Fetching users from API...');
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');
      
      console.log('API URL:', API_ENDPOINTS.USERS_LIST);
      
      const response = await fetch(API_ENDPOINTS.USERS_LIST, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setUsers(Array.isArray(data) ? data : []);
      } else {
        console.error('API Error:', response.status, response.statusText);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users",
        });
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedPermissions = localStorage.getItem('rolePermissions');
    if (storedPermissions) {
      setRolePermissions(JSON.parse(storedPermissions));
    }

    fetchUsers();
  }, []);

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

  const createUser = async (userData: any) => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Creating user with data:', userData);
      
      const response = await fetch(API_ENDPOINTS.CREATE_USER, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
          email: userData.email,
          role: userData.role,
          privileges: userData.permissions
        }),
      });

      console.log('Create user response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('User created successfully:', result);
        toast({
          title: "User created",
          description: "New user has been created successfully.",
        });
        fetchUsers();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Create user API Error:', response.status, errorData);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to create user",
        });
        return false;
      }
    } catch (error) {
      console.error('Create user error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
      return false;
    }
  };

  const updateUser = async (userData: any, userId: string) => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Updating user with data:', userData, 'ID:', userId);
      
      const updatePayload: any = {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        privileges: userData.permissions
      };

      // Only include password if it's provided
      if (userData.password && userData.password.trim() !== '') {
        updatePayload.password = userData.password;
      }
      
      const response = await fetch(API_ENDPOINTS.UPDATE_USER(userId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      console.log('Update user response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('User updated successfully:', result);
        toast({
          title: "User updated",
          description: "User has been updated successfully.",
        });
        fetchUsers();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Update user API Error:', response.status, errorData);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to update user",
        });
        return false;
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
      return false;
    }
  };

  const onSubmitUser = async (data: any) => {
    if (editingUser) {
      const success = await updateUser(data, editingUser._id);
      if (success) {
        setIsUserDialogOpen(false);
        setEditingUser(null);
        form.reset();
      }
    } else {
      const success = await createUser(data);
      if (success) {
        setIsUserDialogOpen(false);
        setEditingUser(null);
        form.reset();
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      permissions: user.privileges
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

  const selectedRole = form.watch('role');
  const selectedPermissions = form.watch('permissions') || [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
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
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'active' : 'inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.date).toLocaleDateString()}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
