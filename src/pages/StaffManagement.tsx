
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AddEditEmployeeForm from '@/components/AddEditEmployeeForm';

interface Employee {
  _id: string;
  empCode: string;
  fullName: string;
  designation: string;
  department: string;
  email?: string;
}

const StaffManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const fetchEmployees = async (empCode?: string) => {
    setIsLoading(true);
    console.log('Fetching employees...', empCode ? `with empCode: ${empCode}` : 'all employees');
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');
      
      const url = empCode 
        ? `https://pel-gel-backend.onrender.com/v1/api/employeesList?empCode=${empCode}`
        : 'https://pel-gel-backend.onrender.com/v1/api/employeesList';
      
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setEmployees(data.data || []);
      } else {
        console.error('API Error:', response.status, response.statusText);
        toast({
          variant: "destructive", 
          title: "Error",
          description: "Failed to fetch employees",
        });
      }
    } catch (error) {
      console.error('Fetch employees error:', error);
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
    fetchEmployees();
  }, []);

  const handleSearch = () => {
    fetchEmployees(searchCode);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleEmployeeSaved = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search by Employee Code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-64"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                SEARCH
              </Button>
            </div>
            <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              ADD
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee, index) => (
                    <TableRow key={employee._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{employee.empCode}</TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          EDIT
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'New Employee'}
            </DialogTitle>
          </DialogHeader>
          <AddEditEmployeeForm
            employee={editingEmployee}
            onSave={handleEmployeeSaved}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
