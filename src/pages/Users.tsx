
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

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

const Users = () => {
  const { toast } = useToast();
  const [rolePermissions, setRolePermissions] = useState({
    admin: ['dashboard', 'incentives', 'staff', 'reports', 'master_data', 'settings'],
    manager: ['dashboard', 'incentives', 'staff', 'reports'],
    user: ['dashboard', 'incentives'],
    hr: ['dashboard', 'staff', 'master_data']
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
    
    localStorage.setItem('users', JSON.stringify(users));
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
    </div>
  );
};

export default Users;
