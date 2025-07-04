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
import { Calendar } from '@/components/ui/calendar';
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
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Shift {
  _id: string;
  shiftName: string;
  shiftHrs: number;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
}

interface NatureCategory {
  _id: string;
  name: string;
  category: string;
  isDeleted: boolean;
  // Additional properties for nature objects
  productionType?: string;
  productionCode?: string;
  manpower?: number;
  norms?: number;
  incentives?: Array<{
    min: number;
    max: number | null;
    amount: number;
    each: number;
  }>;
  startDate?: string;
  endDate?: string;
}

interface ProductionNature {
  id: string;
  name: string;
  productionType: string;
  productionCode: string;
  manpower: number;
  norms: number;
  incentives: Array<{
    min: number;
    max: number | null;
    amount: number;
    each: number;
  }>;
  startDate: string;
  endDate: string;
}

interface Employee {
  _id: string;
  empCode: string;
  fullName: string;
  department?: string;
  designation?: string;
}

interface SelectedCustomer {
  id: string;
  customerName: string;
  empCode: string;
  incentive: number;
}

const ProductionIncentiveEntry = () => {
  const [productionDate, setProductionDate] = useState<Date | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedNature, setSelectedNature] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Auto-populated fields (now editable)
  const [productionType, setProductionType] = useState('');
  const [manpower, setManpower] = useState('');
  const [norms, setNorms] = useState('');
  const [shiftHrs, setShiftHrs] = useState('');
  const [originalNorms, setOriginalNorms] = useState(0); // Store original norms for calculation
  const [originalManpower, setOriginalManpower] = useState(1); // Store original manpower for calculation
  const [originalShiftHrs, setOriginalShiftHrs] = useState(1); // Store original shift hours for calculation
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [buildings, setBuildings] = useState<NatureCategory[]>([]);
  const [natures, setNatures] = useState<NatureCategory[]>([]);
  const [allNatureData, setAllNatureData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<SelectedCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const { toast } = useToast();
  const baseURL = 'https://pel-gel-backend.onrender.com/v1/api';

  const fetchNatureAndBuildings = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(`${baseURL}/getNatureListByCategory`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Nature and Buildings data:', data);
        
        const allData = data.data || [];
        setAllNatureData(allData);
        
        // Buildings are the top-level items
        const buildingsData = allData.map((building: any) => ({
          _id: building.id,
          name: building.name,
          category: 'building',
          isDeleted: false
        }));
        
        // Natures are within productionNatures array of each building
        const naturesData: any[] = [];
        allData.forEach((building: any) => {
          if (building.productionNatures) {
            building.productionNatures.forEach((nature: any) => {
              naturesData.push({
                _id: nature.id,
                name: nature.name,
                category: 'nature',
                isDeleted: false,
                ...nature
              });
            });
          }
        });
        
        console.log('Processed buildings:', buildingsData);
        console.log('Processed natures:', naturesData);
        
        setBuildings(buildingsData);
        setNatures(naturesData);
      } else {
        console.error('Failed to fetch nature/buildings:', response.status);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch buildings and nature data",
        });
      }
    } catch (error) {
      console.error('Error fetching nature/buildings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server for nature/buildings",
      });
    }
  };

  const fetchShifts = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(`${baseURL}/ProductionShift`, {
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
        console.error('Failed to fetch shifts:', response.status);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch shifts data",
        });
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server for shifts",
      });
    }
  };

  const searchEmployees = async (query: string) => {
    if (query.length < 2) {
      setEmployees([]);
      return;
    }

    setSearchLoading(true);
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(`${baseURL}/employeesList?empCode=${query}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Employees search result:', data);
        setEmployees(data.data || []);
      } else {
        console.error('Failed to search employees:', response.status);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      setEmployees([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleNatureChange = (natureId: string) => {
    setSelectedNature(natureId);
    
    // Find the selected nature and auto-populate fields
    const selectedNatureData = natures.find(nature => nature._id === natureId);
    if (selectedNatureData && selectedNatureData.productionType) {
      setProductionType(selectedNatureData.productionType);
      const originalManpowerValue = selectedNatureData.manpower || 1;
      const originalNormsValue = selectedNatureData.norms || 0;
      
      setManpower(originalManpowerValue.toString());
      setNorms(originalNormsValue.toString());
      setOriginalNorms(originalNormsValue);
      setOriginalManpower(originalManpowerValue);
    }
  };

  const handleShiftChange = (shiftId: string) => {
    setSelectedShift(shiftId);
    
    // Find the selected shift and auto-populate shift hours
    const selectedShiftData = shifts.find(shift => shift._id === shiftId);
    if (selectedShiftData) {
      const originalShiftHrsValue = selectedShiftData.shiftHrs;
      setShiftHrs(originalShiftHrsValue.toString());
      setOriginalShiftHrs(originalShiftHrsValue);
    }
  };

  const calculateIncentiveAmount = () => {
    console.log('=== Incentive Calculation Debug ===');
    console.log('selectedNature:', selectedNature);
    console.log('originalNorms:', originalNorms);
    console.log('current norms:', norms);
    console.log('current manpower:', manpower);
    console.log('current shiftHrs:', shiftHrs);

    // If any required values are missing, return 0
    if (!selectedNature || !originalNorms || !norms || !manpower || !shiftHrs) {
      console.log('Missing required values, returning 0');
      return 0;
    }

    const currentNorms = parseFloat(norms) || 0;
    const currentManpower = parseInt(manpower) || 1;
    const currentShiftHrs = parseFloat(shiftHrs) || 1;

    console.log('Parsed values:', { currentNorms, currentManpower, currentShiftHrs });
    console.log('Original values:', { originalNorms, originalManpower, originalShiftHrs });

    // Calculate expected norms based on current manpower and shift hours
    const perPersonPerHourNorms = originalNorms / (originalManpower * originalShiftHrs);
    const expectedNorms = perPersonPerHourNorms * currentManpower * currentShiftHrs;
    
    console.log('Expected norms for current setup:', expectedNorms);
    console.log('Actual norms entered:', currentNorms);

    // Find the selected nature data to get incentives
    const selectedNatureData = natures.find(nature => nature._id === selectedNature);
    if (!selectedNatureData || !selectedNatureData.incentives) {
      console.log('No nature data or incentives found');
      return 0;
    }

    console.log('Selected nature incentives:', selectedNatureData.incentives);

    // Calculate the difference between actual norms and expected norms
    const difference = currentNorms - expectedNorms;
    console.log('Norms difference (actual - expected):', difference);

    // If difference is less than or equal to 0, no incentive
    if (difference <= 0) {
      console.log('Difference is <= 0, no incentive');
      return 0;
    }

    // Find the appropriate incentive tier based on the difference
    const incentiveTiers = selectedNatureData.incentives;
    let applicableTier = null;

    console.log('Checking tiers for difference:', difference);
    for (const tier of incentiveTiers) {
      console.log(`Checking tier: min=${tier.min}, max=${tier.max}, amount=${tier.amount}, each=${tier.each}`);
      if (difference >= tier.min && (tier.max === null || difference <= tier.max)) {
        applicableTier = tier;
        console.log('Found applicable tier:', tier);
        break;
      }
    }

    // If no tier matches, return 0
    if (!applicableTier) {
      console.log('No applicable tier found');
      return 0;
    }

    // Calculate the incentive
    const eligibleUnits = Math.floor(difference / applicableTier.each);
    const totalIncentive = eligibleUnits * applicableTier.amount;

    console.log('Calculation:', {
      difference,
      expectedNorms,
      actualNorms: currentNorms,
      each: applicableTier.each,
      eligibleUnits,
      amount: applicableTier.amount,
      totalIncentive
    });

    return parseFloat(totalIncentive.toFixed(2));
  };

  const handleManpowerChange = (value: string) => {
    setManpower(value);
    
    // Recalculate norms based on new manpower
    const newManpower = parseInt(value) || 1;
    if (originalNorms > 0 && originalManpower > 0) {
      // Calculate per-person norms from original data, then multiply by new manpower
      const perPersonNorms = originalNorms / originalManpower;
      const calculatedNorms = perPersonNorms * newManpower;
      setNorms(calculatedNorms.toString());
    }

    // Update incentives for all selected customers
    updateAllCustomerIncentives();
  };

  const handleShiftHrsChange = (value: string) => {
    setShiftHrs(value);
    
    // Recalculate norms based on new shift hours
    const newShiftHrs = parseFloat(value) || 1;
    if (originalNorms > 0 && originalShiftHrs > 0) {
      // Calculate per-hour norms from original data, then multiply by new shift hours
      const perHourNorms = originalNorms / originalShiftHrs;
      const calculatedNorms = perHourNorms * newShiftHrs;
      setNorms(calculatedNorms.toString());
    }

    // Update incentives for all selected customers
    updateAllCustomerIncentives();
  };

  const handleNormsChange = (value: string) => {
    setNorms(value);
    // Update incentives for all selected customers when norms change manually
    updateAllCustomerIncentives();
  };

  const updateAllCustomerIncentives = () => {
    // Use setTimeout to ensure state updates are processed first
    setTimeout(() => {
      const calculatedIncentive = calculateIncentiveAmount();
      setSelectedCustomers(prev => 
        prev.map(customer => ({
          ...customer,
          incentive: calculatedIncentive
        }))
      );
    }, 0);
  };

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearch(value);
    searchEmployees(value);
  };

  const addCustomerToTable = (employee: Employee) => {
    // Check if already added
    if (selectedCustomers.find(customer => customer.empCode === employee.empCode)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Customer already added to the table",
      });
      return;
    }

    // Check if manpower limit is reached
    const manpowerLimit = parseInt(manpower) || 0;
    if (selectedCustomers.length >= manpowerLimit) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Cannot add more customers. Maximum limit is ${manpowerLimit} (Manpower)`,
      });
      return;
    }

    // Calculate incentive for the new customer
    const calculatedIncentive = calculateIncentiveAmount();

    const newCustomer: SelectedCustomer = {
      id: employee._id,
      customerName: employee.fullName,
      empCode: employee.empCode,
      incentive: calculatedIncentive
    };

    setSelectedCustomers(prev => [...prev, newCustomer]);
    setCustomerSearch('');
    setEmployees([]);
  };

  const removeCustomerFromTable = (empCode: string) => {
    setSelectedCustomers(prev => prev.filter(customer => customer.empCode !== empCode));
  };

  const updateCustomerIncentive = (empCode: string, incentive: number) => {
    setSelectedCustomers(prev => 
      prev.map(customer => 
        customer.empCode === empCode 
          ? { ...customer, incentive }
          : customer
      )
    );
  };

  const handleSubmit = async () => {
    if (!productionDate || !selectedBuilding || !selectedNature || !selectedShift || selectedCustomers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all required fields and add at least one customer",
      });
      return;
    }

    // Check if selected customers count matches manpower
    const manpowerLimit = parseInt(manpower) || 0;
    if (selectedCustomers.length !== manpowerLimit) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Number of selected customers (${selectedCustomers.length}) must match the manpower requirement (${manpowerLimit})`,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      
      // Get selected nature and shift objects for additional data
      const selectedNatureData = natures.find(nature => nature._id === selectedNature);
      const selectedShiftData = shifts.find(shift => shift._id === selectedShift);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Send data for each customer one by one
      for (const customer of selectedCustomers) {
        const payload = {
          productionDate: format(productionDate, 'yyyy-MM-dd'),
          building_id: selectedBuilding,
          nature_id: selectedNature,
          employee_id: customer.id,
          shift_id: selectedShift,
          shiftName: selectedShiftData?.shiftName || '',
          shiftHrs: shiftHrs,
          manpower: manpower,
          employeeCode: customer.empCode,
          incentiveAmount: customer.incentive,
          productionType: selectedNatureData?.productionType || '',
          norms: norms,
        };

        console.log('Submitting timesheet for customer:', customer.customerName, payload);

        try {
          const response = await fetch(`${baseURL}/createTimeSheet`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            successCount++;
            console.log(`Successfully created timesheet for ${customer.customerName}`);
          } else {
            errorCount++;
            const errorData = await response.json();
            console.error(`Failed to create timesheet for ${customer.customerName}:`, errorData);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error creating timesheet for ${customer.customerName}:`, error);
        }
      }

      // Show final result
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "Success",
          description: `Time sheets created successfully for all ${successCount} customers`,
        });
        
        // Reset form
        setProductionDate(null);
        setSelectedBuilding('');
        setSelectedNature('');
        setSelectedShift('');
        setProductionType('');
        setManpower('');
        setNorms('');
        setShiftHrs('');
        setSelectedCustomers([]);
        setCustomerSearch('');
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: `${successCount} time sheets created successfully, ${errorCount} failed`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to create time sheets for all customers`,
        });
      }
    } catch (error) {
      console.error('Error in submit process:', error);
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
    const loadData = async () => {
      setIsLoading(true);
      console.log('Loading dropdown data...');
      
      await Promise.all([
        fetchShifts(),
        fetchNatureAndBuildings()
      ]);
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Production Incentive Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6 mb-6">
            {/* Production Date */}
            <div className="space-y-2">
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
                    {productionDate ? 
                      format(productionDate, "dd-MM-yyyy") : 
                      "dd-mm-yyyy"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={productionDate || undefined}
                    onSelect={(date) => setProductionDate(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Production Building */}
            <div className="space-y-2">
              <Label>Production Building</Label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select Building"} />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Production Nature */}
            <div className="space-y-2">
              <Label>Production Nature</Label>
              <Select value={selectedNature} onValueChange={handleNatureChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select Nature"} />
                </SelectTrigger>
                <SelectContent>
                  {natures.map((nature) => (
                    <SelectItem key={nature._id} value={nature._id}>
                      {nature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Production Shift */}
            <div className="space-y-2">
              <Label>Production Shift</Label>
              <Select value={selectedShift} onValueChange={handleShiftChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select Shift"} />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift._id} value={shift._id}>
                      {shift.shiftName} ({shift.startTime} - {shift.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row - Editable fields */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="space-y-2">
              <Label>Production Type</Label>
              <Input value={productionType} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Man power</Label>
              <Input 
                value={manpower} 
                onChange={(e) => handleManpowerChange(e.target.value)}
                type="number"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Norms</Label>
              <Input 
                value={norms} 
                onChange={(e) => handleNormsChange(e.target.value)}
                type="number"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Shift Hrs</Label>
              <Input 
                value={shiftHrs} 
                onChange={(e) => handleShiftHrsChange(e.target.value)}
                type="number"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Display calculated incentive amount */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              Calculated Incentive per Employee: ₹{calculateIncentiveAmount().toFixed(2)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Based on actual norms: {norms} vs expected norms: {originalNorms && originalManpower && originalShiftHrs ? ((originalNorms / (originalManpower * originalShiftHrs)) * (parseInt(manpower) || 1) * (parseFloat(shiftHrs) || 1)).toFixed(2) : 'N/A'}
            </div>
          </div>

          {/* Search Customer */}
          <div className="space-y-2 mb-6">
            <Label>Search Customer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Start typing customer name..."
                value={customerSearch}
                onChange={(e) => handleCustomerSearchChange(e.target.value)}
                className="pl-10"
              />
              {searchLoading && (
                <div className="absolute right-3 top-3 text-sm text-gray-500">
                  Searching...
                </div>
              )}
            </div>
            
            {/* Employee Search Results */}
            {employees.length > 0 && (
              <div className="mt-2 border rounded-md bg-white shadow-sm max-h-48 overflow-y-auto">
                {employees.map((employee) => (
                  <div
                    key={employee._id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                    onClick={() => addCustomerToTable(employee)}
                  >
                    <div>
                      <div className="font-medium">{employee.fullName}</div>
                      <div className="text-sm text-gray-500">Code: {employee.empCode}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Customers Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Selected Customers</h3>
              {manpower && (
                <div className="text-sm text-gray-500">
                  {selectedCustomers.length} / {manpower} customers selected
                </div>
              )}
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Employee Code</TableHead>
                    <TableHead>Incentive (₹)</TableHead>
                    <TableHead className="w-20">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No customers selected
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedCustomers.map((customer, index) => (
                      <TableRow key={customer.empCode}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{customer.customerName}</TableCell>
                        <TableCell>{customer.empCode}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={customer.incentive}
                            onChange={(e) => updateCustomerIncentive(customer.empCode, Number(e.target.value))}
                            className="w-24"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeCustomerFromTable(customer.empCode)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>

          {/* Debug Info */}
          {isLoading && (
            <div className="text-center text-gray-500 py-4">
              Loading dropdown data...
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-4">
            <p>Shifts loaded: {shifts.length}</p>
            <p>Buildings loaded: {buildings.length}</p>
            <p>Natures loaded: {natures.length}</p>
            <p>Selected customers: {selectedCustomers.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionIncentiveEntry;
