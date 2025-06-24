
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Search } from 'lucide-react';

interface AllowanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  allowanceType: string;
  amount: number;
  date: string;
  shift: string;
  department: string;
}

const ViewAllowanceRecords = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [allowanceRecords, setAllowanceRecords] = useState<AllowanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select both from and to dates",
      });
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "From date cannot be greater than to date",
      });
      return;
    }

    setIsLoading(true);
    console.log('Searching allowance records from', fromDate, 'to', toDate);

    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');

      // Updated endpoint to use getEmpAllowences
      const response = await fetch(`https://pel-gel-backend.onrender.com/v1/api/getEmpAllowences?fromDate=${fromDate}&toDate=${toDate}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Allowance records data:', data);
        
        // Transform the API data to match our interface
        const transformedRecords = (data.data || []).map((record: any) => ({
          _id: record._id,
          employeeId: record.empCode,
          employeeName: record.employee_id?.fullName || 'Unknown',
          allowanceType: record.allowance_id?.allowence || 'Unknown',
          amount: parseFloat(record.amount) || 0, // Convert string to number
          date: record.productionDate,
          shift: record.allowance_id?.shift || 'Unknown',
          department: 'Unknown' // This field is not in the API response
        }));
        
        setAllowanceRecords(transformedRecords);
        
        if (transformedRecords.length === 0) {
          toast({
            title: "No Records Found",
            description: "No allowance records found for the selected date range",
          });
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch allowance records",
        });
      }
    } catch (error) {
      console.error('Fetch allowance records error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return allowanceRecords.reduce((total, record) => total + (parseFloat(String(record.amount)) || 0), 0);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            View Allowance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search Records'}
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          {allowanceRecords.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-800 font-medium">
                  Total Records: {allowanceRecords.length}
                </span>
                <span className="text-green-800 font-bold">
                  Total Amount: ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Allowance Records Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white">
                  <TableHead className="text-white font-bold">#</TableHead>
                  <TableHead className="text-white font-bold">Employee ID</TableHead>
                  <TableHead className="text-white font-bold">Employee Name</TableHead>
                  <TableHead className="text-white font-bold">Allowance Type</TableHead>
                  <TableHead className="text-white font-bold">Amount</TableHead>
                  <TableHead className="text-white font-bold">Date</TableHead>
                  <TableHead className="text-white font-bold">Shift</TableHead>
                  <TableHead className="text-white font-bold">Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading allowance records...
                    </TableCell>
                  </TableRow>
                ) : allowanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {fromDate && toDate ? 'No allowance records found for the selected date range' : 'Select date range and click search to view allowance records'}
                    </TableCell>
                  </TableRow>
                ) : (
                  allowanceRecords.map((record, index) => (
                    <TableRow key={record._id} className={index % 2 === 1 ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.allowanceType}</TableCell>
                      <TableCell className="font-medium">₹{record.amount}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.shift}</TableCell>
                      <TableCell>{record.department}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAllowanceRecords;
