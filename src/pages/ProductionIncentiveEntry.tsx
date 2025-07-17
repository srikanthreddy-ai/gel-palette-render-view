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
import { Calendar as CalendarIcon, Search, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
  individualTarget: number;
  producedQty: number;
  workedHrs: number;
  incentive: number;
}

const ProductionIncentiveEntry = () => {
  const [productionDate, setProductionDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedNature, setSelectedNature] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Auto-populated fields (now editable)
  const [productionType, setProductionType] = useState('');
  const [manpower, setManpower] = useState('');
  const [norms, setNorms] = useState('');
  const [employeeNorms, setEmployeeNorms] = useState('');
  const [shiftHrs, setShiftHrs] = useState('');
  const [workedHrs, setWorkedHrs] = useState('');
  const [producedQty, setProducedQty] = useState(''); // Move Produced Qty to main form for group type
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    // Clear selected nature when building changes
    setSelectedNature('');
    // Clear auto-populated fields
    setProductionType('');
    setManpower('');
    setNorms('');
    setEmployeeNorms('');
    setProducedQty('');
    setOriginalNorms(0);
    setOriginalManpower(1);
    // Clear selected customers as their incentives are based on the previous building's nature
    setSelectedCustomers([]);
  };

  const getFilteredNatures = () => {
    if (!selectedBuilding) return [];
    
    // Find the selected building data
    const selectedBuildingData = allNatureData.find(building => building.id === selectedBuilding);
    
    if (!selectedBuildingData || !selectedBuildingData.productionNatures) return [];
    
    // Return production natures for the selected building
    return selectedBuildingData.productionNatures.map((nature: any) => ({
      _id: nature.id,
      name: nature.name,
      category: 'nature',
      isDeleted: false,
      ...nature
    }));
  };

  const calculatePerHeadHour = () => {
    const selectedNatureData = getFilteredNatures().find(nature => nature._id === selectedNature);
    const selectedShiftData = shifts.find(shift => shift._id === selectedShift);
    
    if (!selectedNatureData || !selectedShiftData) return 0;
    
    const defaultNorms = selectedNatureData.norms || 0;
    const defaultManpower = selectedNatureData.manpower || 1;
    const defaultShiftHrs = selectedShiftData.shiftHrs || 8;
    
    const perHeadHour = defaultNorms / defaultManpower / defaultShiftHrs;
    return parseFloat(perHeadHour.toFixed(4));
  };

  const calculateTargetNormsForGroup = (productionHrs: number, inputManpower: number) => {
    const perHeadHour = calculatePerHeadHour();
    
    // Target Norms = perheadhour * production Hrs * manpower (from input)
    const targetNorms = perHeadHour * productionHrs * inputManpower;
    
    console.log('=== Group Target Norms Calculation ===');
    console.log('Per Head Hour:', perHeadHour);
    console.log('Production Hrs:', productionHrs);
    console.log('Input Manpower:', inputManpower);
    console.log('Calculated Target Norms:', targetNorms);
    
    return Math.round(targetNorms);
  };

  const getTargetNormsValue = () => {
    if (productionType.toLowerCase() === 'group') {
      const currentManpower = parseInt(manpower) || 1;
      const currentWorkedHrs = parseFloat(workedHrs) || 1;
      return calculateTargetNormsForGroup(currentWorkedHrs, currentManpower);
    }
    return parseFloat(employeeNorms) || 0;
  };

  const handleNatureChange = (natureId: string) => {
    setSelectedNature(natureId);
    
    // Find the selected nature from filtered natures
    const filteredNatures = getFilteredNatures();
    const selectedNatureData = filteredNatures.find(nature => nature._id === natureId);
    if (selectedNatureData && selectedNatureData.productionType) {
      setProductionType(selectedNatureData.productionType);
      const originalManpowerValue = selectedNatureData.manpower || 1;
      const originalNormsValue = selectedNatureData.norms || 0;
      
      setManpower(originalManpowerValue.toString());
      setNorms(originalNormsValue.toString());
      setOriginalNorms(originalNormsValue);
      setOriginalManpower(originalManpowerValue);
      
      // If production type is group, calculate target norms based on the formula
      if (selectedNatureData.productionType.toLowerCase() === 'group') {
        const currentWorkedHrs = parseFloat(workedHrs) || originalShiftHrs;
        const calculatedTargetNorms = calculateTargetNormsForGroup(currentWorkedHrs, originalManpowerValue);
        setEmployeeNorms(calculatedTargetNorms.toString());
      } else {
        setEmployeeNorms(originalNormsValue.toString());
      }
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
      // Default worked hours to shift hours
      setWorkedHrs(originalShiftHrsValue.toString());
    }
  };

  const calculateIndividualTargetNorms = (customerWorkedHrs: number) => {
    const perHeadHour = calculatePerHeadHour();
    const currentManpower = parseInt(manpower) || 1;
    // Individual Target = PerHead Hour * ManPower * worked hours
    return Math.round(perHeadHour * currentManpower * customerWorkedHrs);
  };

  const calculateCustomerIncentive = (individualTarget: number, producedQty: number) => {
    console.log('=== Customer Incentive Calculation Debug ===');
    console.log('individualTarget:', individualTarget);
    console.log('producedQty:', producedQty);
    console.log('selectedNature:', selectedNature);

    // If any required values are missing, return 0
    if (!selectedNature || individualTarget === 0) {
      console.log('Missing required values, returning 0');
      return 0;
    }

    let extraNorms = 0;
    
    if (productionType.toLowerCase() === 'group') {
      // For group production, calculate extraNorms = Net Production - Target Norms
      const netProduction = parseFloat(producedQty.toString()) || 0;
      const targetNorms = getTargetNormsValue();
      extraNorms = netProduction - targetNorms;
      console.log('Group production - Net Production:', netProduction, 'Target Norms:', targetNorms);
    } else {
      // For individual production, calculate extraNorms = Produced Qty - Individual Target  
      extraNorms = producedQty - individualTarget;
    }
    
    console.log('Extra norms:', extraNorms);

    // If extraNorms is less than or equal to 0, no incentive
    if (extraNorms <= 0) {
      console.log('Extra norms is <= 0, no incentive');
      return 0;
    }

    // Find the selected nature data from filtered natures
    const filteredNatures = getFilteredNatures();
    const selectedNatureData = filteredNatures.find(nature => nature._id === selectedNature);
    if (!selectedNatureData || !selectedNatureData.incentives) {
      console.log('No nature data or incentives found');
      return 0;
    }

    console.log('Selected nature incentives:', selectedNatureData.incentives);

    // Find the appropriate incentive tier based on extraNorms
    const incentiveTiers = selectedNatureData.incentives;
    let applicableTier = null;

    console.log('Checking tiers for extraNorms:', extraNorms);
    for (const tier of incentiveTiers) {
      console.log(`Checking tier: min=${tier.min}, max=${tier.max}, amount=${tier.amount}, each=${tier.each}`);
      if (extraNorms >= tier.min && (tier.max === null || extraNorms <= tier.max)) {
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

    // Calculate incentiveAmount = (extraNorms / each) * amount
    const incentiveAmount = (extraNorms / applicableTier.each) * applicableTier.amount;

    console.log('Customer Calculation:', {
      extraNorms,
      each: applicableTier.each,
      amount: applicableTier.amount,
      incentiveAmount
    });

    return parseFloat(incentiveAmount.toFixed(2));
  };

  const calculateIncentiveAmount = () => {
    // This function is deprecated - use calculateCustomerIncentive instead
    return 0;
  };

  const handleManpowerChange = (value: string) => {
    setManpower(value);
    
    // Recalculate employee norms based on new manpower and worked hours
    const newManpower = parseInt(value) || 1;
    const currentWorkedHrs = parseFloat(workedHrs) || originalShiftHrs;
    
    if (originalNorms > 0 && originalManpower > 0 && originalShiftHrs > 0) {
      if (productionType.toLowerCase() === 'group') {
        // For group production type, use the special calculation
        const calculatedTargetNorms = calculateTargetNormsForGroup(currentWorkedHrs, newManpower);
        setEmployeeNorms(calculatedTargetNorms.toString());
      } else {
        // Calculate per-person per-hour norms from original data
        const perPersonPerHourNorms = originalNorms / (originalManpower * originalShiftHrs);
        // Calculate based on new manpower and current worked hours
        const calculatedEmployeeNorms = perPersonPerHourNorms * newManpower * currentWorkedHrs;
        setEmployeeNorms(Math.round(calculatedEmployeeNorms).toString());
      }
    }

    // Update incentives for all selected customers (preserve manual changes)
    updateNewCustomerIncentives();
  };

  const handleWorkedHrsChange = (value: string) => {
    setWorkedHrs(value);
    
    // Recalculate employee norms based on current manpower and new worked hours
    const currentManpower = parseInt(manpower) || 1;
    const newWorkedHrs = parseFloat(value) || 0;
    
    if (originalNorms > 0 && originalManpower > 0 && originalShiftHrs > 0) {
      if (productionType.toLowerCase() === 'group') {
        // For group production type, use the special calculation
        const calculatedTargetNorms = calculateTargetNormsForGroup(newWorkedHrs, currentManpower);
        setEmployeeNorms(calculatedTargetNorms.toString());
      } else {
        // Calculate per-person per-hour norms from original data
        const perPersonPerHourNorms = originalNorms / (originalManpower * originalShiftHrs);
        // Calculate based on current manpower and new worked hours
        const calculatedEmployeeNorms = perPersonPerHourNorms * currentManpower * newWorkedHrs;
        setEmployeeNorms(Math.round(calculatedEmployeeNorms).toString());
      }
    }

    // Update incentives for all selected customers (preserve manual changes)
    updateNewCustomerIncentives();
  };

  const updateAllCustomerIncentives = () => {
    // Use setTimeout to ensure state updates are processed first
    setTimeout(() => {
      const individualTargetValue = parseInt(employeeNorms) || 0;
      setSelectedCustomers(prev => 
        prev.map(customer => {
          const calculatedIncentive = calculateCustomerIncentive(individualTargetValue, customer.producedQty);
          return {
            ...customer,
            incentive: calculatedIncentive,
            individualTarget: individualTargetValue
          };
        })
      );
    }, 0);
  };

  const updateNewCustomerIncentives = () => {
    // Update incentives and individual targets for all customers
    setTimeout(() => {
      setSelectedCustomers(prev => 
        prev.map(customer => {
          // Recalculate individual target based on customer's worked hours
          const newIndividualTarget = productionType.toLowerCase() === 'group' 
            ? calculateIndividualTargetNorms(customer.workedHrs)
            : parseInt(employeeNorms) || 0;
          
          // Recalculate incentive based on new individual target and produced qty
          const newIncentive = calculateCustomerIncentive(newIndividualTarget, customer.producedQty);
          
          return {
            ...customer,
            incentive: newIncentive,
            individualTarget: newIndividualTarget
          };
        })
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

    // Calculate individual target for the new customer
    const customerWorkedHrs = parseFloat(workedHrs) || 0;
    const individualTargetValue = productionType.toLowerCase() === 'group' 
      ? calculateIndividualTargetNorms(customerWorkedHrs)
      : parseInt(employeeNorms) || 0;
    const calculatedIncentive = calculateCustomerIncentive(individualTargetValue, 0);

    const newCustomer: SelectedCustomer = {
      id: employee._id,
      customerName: employee.fullName,
      empCode: employee.empCode,
      individualTarget: individualTargetValue,
      producedQty: 0,
      workedHrs: customerWorkedHrs,
      incentive: calculatedIncentive
    };

    setSelectedCustomers(prev => [...prev, newCustomer]);
    setCustomerSearch('');
    setEmployees([]);
  };

  const removeCustomerFromTable = (empCode: string) => {
    setSelectedCustomers(prev => prev.filter(customer => customer.empCode !== empCode));
  };

  const updateCustomerField = (empCode: string, field: keyof SelectedCustomer, value: number) => {
    setSelectedCustomers(prev => 
      prev.map(customer => {
        if (customer.empCode === empCode) {
          const updatedCustomer = { ...customer, [field]: value };
          
          // If worked hours changed, recalculate individual target and incentive
          if (field === 'workedHrs' && productionType.toLowerCase() === 'group') {
            const newIndividualTarget = calculateIndividualTargetNorms(value);
            const newIncentive = calculateCustomerIncentive(newIndividualTarget, updatedCustomer.producedQty);
            return {
              ...updatedCustomer,
              individualTarget: newIndividualTarget,
              incentive: newIncentive
            };
          }
          
          // If produced qty changed, recalculate incentive
          if (field === 'producedQty') {
            const newIncentive = calculateCustomerIncentive(updatedCustomer.individualTarget, value);
            return {
              ...updatedCustomer,
              incentive: newIncentive
            };
          }
          
          return updatedCustomer;
        }
        return customer;
      })
    );
  };

  const updateCustomerIncentive = (empCode: string, incentive: number) => {
    updateCustomerField(empCode, 'incentive', parseFloat(incentive.toString()) || 0);
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
          shiftHrs: parseFloat(shiftHrs) || 0,
          manpower: parseInt(manpower) || 0,
          employeeCode: customer.empCode,
          incentiveAmount: customer.incentive,
          individualTarget: customer.individualTarget,
          producedQty: customer.producedQty,
          workedHrs: customer.workedHrs,
          productionType: selectedNatureData?.productionType || '',
          norms: parseFloat(norms) || 0,
          employeeNorms: parseFloat(employeeNorms) || 0,
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
        setEmployeeNorms('');
        setProducedQty('');
        setShiftHrs('');
        setWorkedHrs('');
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

  // Calculate pagination values
  const totalPages = Math.ceil(selectedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = selectedCustomers.slice(startIndex, endIndex);

  // Reset to first page when customers change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [selectedCustomers.length, currentPage, totalPages]);

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
          <CardTitle className="text-2xl font-bold">Incentive Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6 mb-6">
            {/* Production Date */}
            <div className="space-y-2">
              <Label>Production Date</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
                    onSelect={(date) => {
                      setProductionDate(date || null);
                      setIsDatePickerOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Production Building */}
            <div className="space-y-2">
              <Label>Production Building</Label>
              <Select value={selectedBuilding} onValueChange={handleBuildingChange} disabled={isLoading}>
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
              <Select value={selectedNature} onValueChange={handleNatureChange} disabled={isLoading || !selectedBuilding}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : !selectedBuilding ? "Select Building First" : "Select Nature"} />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredNatures().map((nature) => (
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
          <div className="grid grid-cols-6 gap-6 mb-6">
            <div className="space-y-2">
              <Label>Production Type</Label>
              <Input value={productionType} readOnly className="bg-gray-50" />
            </div>
            {productionType.toLowerCase() === 'group' && (
              <div className="space-y-2">
                <Label>Per Head Hour</Label>
                <Input 
                  value={calculatePerHeadHour()} 
                  readOnly
                  className="bg-gray-50"
                  type="number"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Default Norms</Label>
              <Input 
                value={norms} 
                readOnly
                className="bg-gray-50"
                type="number"
              />
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
              <Label>Production Hrs</Label>
              <Input 
                value={workedHrs} 
                onChange={(e) => handleWorkedHrsChange(e.target.value)}
                type="number"
                min="0"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Norms</Label>
              <Input 
                value={productionType.toLowerCase() === 'group' ? getTargetNormsValue() : employeeNorms} 
                onChange={(e) => {
                  if (productionType.toLowerCase() !== 'group') {
                    setEmployeeNorms(e.target.value);
                    // Update Individual Target for all existing customers when Target Norms changes
                    setTimeout(() => {
                      const individualTargetValue = parseInt(e.target.value) || 0;
                      setSelectedCustomers(prev => 
                        prev.map(customer => ({
                          ...customer,
                          individualTarget: individualTargetValue
                        }))
                      );
                    }, 0);
                  }
                }}
                type="number"
                min="0"
                readOnly={productionType.toLowerCase() === 'group'}
                className={productionType.toLowerCase() === 'group' ? 'bg-gray-50' : ''}
              />
            </div>
            {productionType.toLowerCase() === 'group' && (
              <div className="space-y-2">
                <Label>Net Production</Label>
                <Input 
                  value={producedQty} 
                  onChange={(e) => setProducedQty(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
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
                    <TableHead>Target Norms</TableHead>
                    {productionType.toLowerCase() !== 'group' && <TableHead>Produced Qty.</TableHead>}
                    <TableHead>Worked Hrs</TableHead>
                    <TableHead>Incentive (₹)</TableHead>
                    <TableHead className="w-20">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                 <TableBody>
                  {selectedCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={productionType.toLowerCase() === 'group' ? 7 : 8} className="text-center text-gray-500 py-8">
                          No customers selected
                        </TableCell>
                      </TableRow>
                   ) : (
                      currentCustomers.map((customer, index) => (
                        <TableRow key={customer.empCode}>
                          <TableCell>{startIndex + index + 1}</TableCell>
                         <TableCell>{customer.customerName}</TableCell>
                         <TableCell>{customer.empCode}</TableCell>
                         <TableCell>
                           <div className="text-sm font-medium">
                             {customer.individualTarget}
                           </div>
                         </TableCell>
                         {productionType.toLowerCase() !== 'group' && (
                           <TableCell>
                             <Input
                               type="number"
                               value={customer.producedQty}
                               onChange={(e) => {
                                 const newProducedQty = parseFloat(e.target.value) || 0;
                                 updateCustomerField(customer.empCode, 'producedQty', newProducedQty);
                               }}
                               className="w-24"
                               step="0.01"
                             />
                           </TableCell>
                         )}
                          <TableCell>
                            <Input
                              type="number"
                              value={customer.workedHrs}
                              onChange={(e) => {
                                const newWorkedHrs = parseFloat(e.target.value) || 0;
                                updateCustomerField(customer.empCode, 'workedHrs', newWorkedHrs);
                              }}
                              className="w-24"
                              step="0.01"
                            />
                          </TableCell>
                         <TableCell>
                           <div className="text-sm font-medium text-green-600">
                             ₹{customer.incentive.toFixed(2)}
                           </div>
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
             
             {/* Pagination Controls */}
             {selectedCustomers.length > itemsPerPage && (
               <div className="flex justify-center mt-4">
                 <Pagination>
                   <PaginationContent>
                     <PaginationItem>
                       <PaginationPrevious
                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                         className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                       />
                     </PaginationItem>
                     
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                       <PaginationItem key={page}>
                         <PaginationLink
                           onClick={() => setCurrentPage(page)}
                           isActive={currentPage === page}
                           className="cursor-pointer"
                         >
                           {page}
                         </PaginationLink>
                       </PaginationItem>
                     ))}
                     
                     <PaginationItem>
                       <PaginationNext
                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                         className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                       />
                     </PaginationItem>
                   </PaginationContent>
                 </Pagination>
               </div>
             )}
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
