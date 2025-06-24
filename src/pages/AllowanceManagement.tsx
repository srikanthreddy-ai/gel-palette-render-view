
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Allowance {
  _id: string;
  allowence: string;
  shift: string;
  amount: number;
  isDeleted: boolean;
}

const AllowanceManagement = () => {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<Allowance | null>(null);
  const { toast } = useToast();

  const fetchAllowances = async () => {
    setIsLoading(true);
    console.log('Fetching allowances data...');
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');
      
      const response = await fetch('https://pel-gel-backend.onrender.com/v1/api/getAllowences', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        // Filter out deleted allowances
        setAllowances(data.data?.filter((allowance: Allowance) => !allowance.isDeleted) || []);
      } else {
        console.error('API Error:', response.status, response.statusText);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch allowances data",
        });
      }
    } catch (error) {
      console.error('Fetch allowances data error:', error);
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
    fetchAllowances();
  }, []);

  const handleAddAllowance = () => {
    setEditingAllowance(null);
    setIsDialogOpen(true);
  };

  const handleEditAllowance = (allowance: Allowance) => {
    setEditingAllowance(allowance);
    setIsDialogOpen(true);
  };

  const handleAllowanceSaved = () => {
    setIsDialogOpen(false);
    setEditingAllowance(null);
    fetchAllowances();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Allowance Management</CardTitle>
          <Button onClick={handleAddAllowance} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            ADD
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white">
                  <TableHead className="text-white font-bold">#</TableHead>
                  <TableHead className="text-white font-bold">Allowance</TableHead>
                  <TableHead className="text-white font-bold">Shift</TableHead>
                  <TableHead className="text-white font-bold">Amount</TableHead>
                  <TableHead className="text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading allowances data...
                    </TableCell>
                  </TableRow>
                ) : allowances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No allowances data found
                    </TableCell>
                  </TableRow>
                ) : (
                  allowances.map((allowance, index) => (
                    <TableRow key={allowance._id} className={index % 2 === 1 ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{allowance.allowence}</TableCell>
                      <TableCell>{allowance.shift}</TableCell>
                      <TableCell>{allowance.amount}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleEditAllowance(allowance)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAllowance ? 'Edit Allowance' : 'New Allowance'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-center text-gray-500">
              Allowance form will be implemented here
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAllowanceSaved}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllowanceManagement;
