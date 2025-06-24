import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Search, X, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface Shift {
  _id: string;
  shiftName: string;
  shiftHrs: number;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
}

interface Allowance {
  _id: string;
  allowence: string;
  shift: string;
  amount: number;
  isDeleted: boolean;
}

interface Employee {
  _id: string;
  empCode: string;
  fullName: string;
  allowance: number;
}

interface SelectedEmployee extends Employee {
  id: string;
  allowanceAmount: number;
}

const AddNewAllowance = () => {
  const [productionDate, setProductionDate] = useState<Date>(new Date());
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedAllowance, setSelectedAllowance] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<SelectedEmployee[]>([]);
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [isLoadingAllowances, setIsLoadingAllowances] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  // Load shifts and allowances on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([fetchShifts(), fetchAllowances()]);
  };

  const fetchShifts = async () => {
    setIsLoadingShifts(true);
    console.log('Fetching shifts...');
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.PRODUCTION_SHIFT, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Shifts data:', data);
        setShifts(data.data?.filter((shift: Shift) => !shift.isDeleted) || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch shifts",
        });
      }
    } catch (error) {
      console.error('Fetch shifts error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoadingShifts(false);
    }
  };

  const fetchAllowances = async () => {
    setIsLoadingAllowances(true);
    console.log('Fetching allowances...');
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.GET_ALLOWANCES, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Allowances data:', data);
        setAllowances(data.data?.filter((allowance: Allowance) => !allowance.isDeleted) || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch allowances",
        });
      }
    } catch (error) {
      console.error('Fetch allowances error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoadingAllowances(false);
    }
  };

  const searchEmployees = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    console.log('Searching employees with query:', searchQuery);
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.EMPLOYEES_LIST(searchQuery), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        setSearchResults(data.data || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to search employees",
        });
      }
    } catch (error) {
      console.error('Search employees error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addEmployeeToTable = (employee: Employee) => {
    if (!selectedAllowance) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an allowance first",
      });
      return;
    }

    const isAlreadyAdded = selectedEmployees.some(emp => emp._id === employee._id);
    if (isAlreadyAdded) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Employee already added to the table",
      });
      return;
    }

    // Get the amount from the selected allowance
    const selectedAllowanceData = allowances.find(allowance => allowance._id === selectedAllowance);
    const allowanceAmount = selectedAllowanceData?.amount || 0;

    const newEmployee: SelectedEmployee = {
      ...employee,
      id: `${employee._id}-${Date.now()}`, // Unique identifier for table row
      allowanceAmount: allowanceAmount,
    };

    setSelectedEmployees(prev => [...prev, newEmployee]);
    setSearchResults([]);
    setSearchQuery('');
    
    toast({
      title: "Success",
      description: "Employee added to the table",
    });
  };

  const removeEmployeeFromTable = (id: string) => {
    setSelectedEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleShiftChange = (shiftId: string, checked: boolean) => {
    setSelectedShifts(prev => {
      if (checked) {
        return [...prev, shiftId];
      } else {
        return prev.filter(id => id !== shiftId);
      }
    });
  };

  const getSelectedShiftNames = () => {
    if (selectedShifts.length === 0) return "Select shifts...";
    if (selectedShifts.length === 1) {
      const shift = shifts.find(s => s._id === selectedShifts[0]);
      return shift?.shiftName || "Select shifts...";
    }
    return `${selectedShifts.length} shifts selected`;
  };

  const handleSubmit = async () => {
    if (!productionDate || selectedShifts.length === 0 || !selectedAllowance || selectedEmployees.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill all required fields and add at least one employee",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting allowance data...');

    try {
      const authToken = sessionStorage.getItem('authToken');
      
      // Create allowance records for each selected employee
      const promises = selectedEmployees.map(async (employee) => {
        const payload = {
          productionDate: format(productionDate, 'yyyy-MM-dd'),
          shifts: selectedShifts,
          allowance_id: selectedAllowance,
          employee_id: employee._id,
          empCode: employee.empCode,
          amount: employee.allowanceAmount,
        };

        console.log('Creating allowance for employee:', payload);

        const response = await fetch(API_ENDPOINTS.CREATE_EMP_ALLOWANCE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to create allowance for employee ${employee.empCode}`);
        }

        return response.json();
      });

      await Promise.all(promises);

      toast({
        title: "Success",
        description: "All allowance records created successfully",
      });

      // Reset form
      setSelectedEmployees([]);
      setSelectedShifts([]);
      setSelectedAllowance('');
      setSearchQuery('');
      setSearchResults([]);

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create allowance records",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex space-x-4 border-b pb-4">
        <div className="border-b-2 border-blue-600 pb-2">
          <span className="text-blue-600 font-medium">NEW ALLOWANCE</span>
        </div>
        <div className="pb-2">
          <span className="text-gray-500">VIEW ALLOWANCE</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Allowance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Production Date */}
            <div>
              <Label>Production Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !productionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {productionDate ? format(productionDate, "dd-MM-yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={productionDate}
                    onSelect={(date) => date && setProductionDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Production Shifts - Multi-select */}
            <div>
              <Label>Production Shifts</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">{getSelectedShiftNames()}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-60 overflow-y-auto">
                    {isLoadingShifts ? (
                      <div className="p-4 text-sm text-muted-foreground">Loading shifts...</div>
                    ) : shifts.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">No shifts available</div>
                    ) : (
                      <div className="p-2">
                        {shifts.map((shift) => (
                          <div key={shift._id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
                            <Checkbox
                              id={shift._id}
                              checked={selectedShifts.includes(shift._id)}
                              onCheckedChange={(checked) => handleShiftChange(shift._id, checked as boolean)}
                            />
                            <label
                              htmlFor={shift._id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {shift.shiftName}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Select Allowance */}
            <div>
              <Label>Select Allowance</Label>
              <Select value={selectedAllowance} onValueChange={setSelectedAllowance}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Allowance" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAllowances ? (
                    <SelectItem value="loading" disabled>Loading allowances...</SelectItem>
                  ) : allowances.length === 0 ? (
                    <SelectItem value="no-data" disabled>No allowances available</SelectItem>
                  ) : (
                    allowances.map((allowance) => (
                      <SelectItem key={allowance._id} value={allowance._id}>
                        {allowance.allowence}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Customer */}
          <div>
            <Label>Search Customer</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Search by employee code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchEmployees()}
              />
              <Button onClick={searchEmployees} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div>
                      <span className="font-medium">{employee.empCode}</span>
                      <span className="text-gray-500 ml-2">{employee.fullName}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addEmployeeToTable(employee)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Employees Table */}
          {selectedEmployees.length > 0 && (
            <div>
              <Label>Selected Employees</Label>
              <div className="border rounded-lg mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.empCode}</TableCell>
                        <TableCell>{employee.fullName}</TableCell>
                        <TableCell>{employee.allowanceAmount}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeEmployeeFromTable(employee.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || selectedEmployees.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Allowance Records'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewAllowance;
