
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, Search, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';

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

interface IncentiveRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  building: string;
  nature: string;
  amount: number;
  date: string;
  shift: string;
  producedQty: number;
  norms: number;
}

interface Building {
  _id: string;
  buildingName: string;
  buildingCode: string;
}

interface Shift {
  _id: string;
  shiftName: string;
  shiftHrs: number;
  startTime: string;
  endTime: string;
}

type Record = AllowanceRecord | IncentiveRecord;

const ViewAllowanceRecords = () => {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [recordType, setRecordType] = useState<'allowance' | 'incentive'>('allowance');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch buildings and shifts on component mount
  useEffect(() => {
    fetchBuildings();
    fetchShifts();
  }, []);

  const fetchBuildings = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.PRODUCTION_DEPT, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBuildings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const fetchShifts = async () => {
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
        setShifts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select both from and to dates",
      });
      return;
    }

    if (fromDate > toDate) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "From date cannot be greater than to date",
      });
      return;
    }

    setIsLoading(true);
    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    const toDateStr = format(toDate, 'yyyy-MM-dd');
    console.log(`Searching ${recordType} records from`, fromDateStr, 'to', toDateStr);

    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');

      const fromDateStr = format(fromDate, 'yyyy-MM-dd');
      const toDateStr = format(toDate, 'yyyy-MM-dd');
      
      let endpoint = '';
      if (recordType === 'allowance') {
        endpoint = `https://pel-gel-backend.onrender.com/v1/api/getEmpAllowences?fromDate=${fromDateStr}&toDate=${toDateStr}`;
      } else {
        endpoint = `https://pel-gel-backend.onrender.com/v1/api/getAllTimeSheets?fromDate=${fromDateStr}&toDate=${toDateStr}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`${recordType} records data:`, data);
        
        let transformedRecords: Record[] = [];
        
        if (recordType === 'allowance') {
          // Transform allowance data
          transformedRecords = (data.data || []).map((record: any) => ({
            _id: record._id,
            employeeId: record.empCode,
            employeeName: record.employee_id?.fullName || 'Unknown',
            allowanceType: record.allowance_id?.allowence || 'Unknown',
            amount: parseFloat(record.amount) || 0,
            date: record.productionDate,
            shift: record.allowance_id?.shift || 'Unknown',
            department: 'Unknown'
          }));
        } else {
          // Transform incentive data
          transformedRecords = (data.data || data || []).map((record: any) => ({
            _id: record._id,
            employeeId: record.employeeCode || record.empCode,
            employeeName: record.employee_id?.fullName || 'Unknown',
            building: record.building_id?.buildingName || 'Unknown',
            nature: record.nature_id?.name || 'Unknown',
            amount: parseFloat(record.incentiveAmount) || 0,
            date: record.productionDate,
            shift: record.shiftName || 'Unknown',
            producedQty: record.producedQty || 0,
            norms: record.norms || 0
          }));
        }
        
        setRecords(transformedRecords);
        
        if (transformedRecords.length === 0) {
          toast({
            title: "No Records Found",
            description: `No ${recordType} records found for the selected date range`,
          });
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to fetch ${recordType} records`,
        });
      }
    } catch (error) {
      console.error(`Fetch ${recordType} records error:`, error);
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
    return records.reduce((total, record) => total + (parseFloat(String(record.amount)) || 0), 0);
  };

  const isAllowanceRecord = (record: Record): record is AllowanceRecord => {
    return recordType === 'allowance';
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            View {recordType === 'allowance' ? 'Allowance' : 'Incentive'} Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="recordType">Record Type</Label>
              <Select value={recordType} onValueChange={(value: 'allowance' | 'incentive') => setRecordType(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowance">Allowance</SelectItem>
                  <SelectItem value="incentive">Incentive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fromDate">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="toDate">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="building">Building</Label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.buildingName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shift">Shift</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  {shifts.map((shift) => (
                    <SelectItem key={shift._id} value={shift._id}>
                      {shift.shiftName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          {records.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-800 font-medium">
                  Total Records: {records.length}
                </span>
                <span className="text-green-800 font-bold">
                  Total Amount: ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Records Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white">
                  <TableHead className="text-white font-bold">#</TableHead>
                  <TableHead className="text-white font-bold">Employee ID</TableHead>
                  <TableHead className="text-white font-bold">Employee Name</TableHead>
                  {recordType === 'allowance' ? (
                    <>
                      <TableHead className="text-white font-bold">Allowance Type</TableHead>
                      <TableHead className="text-white font-bold">Amount</TableHead>
                      <TableHead className="text-white font-bold">Date</TableHead>
                      <TableHead className="text-white font-bold">Shift</TableHead>
                      <TableHead className="text-white font-bold">Department</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-white font-bold">Building</TableHead>
                      <TableHead className="text-white font-bold">Nature</TableHead>
                      <TableHead className="text-white font-bold">Incentive Amount</TableHead>
                      <TableHead className="text-white font-bold">Date</TableHead>
                      <TableHead className="text-white font-bold">Shift</TableHead>
                      <TableHead className="text-white font-bold">Produced Qty</TableHead>
                      <TableHead className="text-white font-bold">Norms</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={recordType === 'allowance' ? 8 : 9} className="text-center py-8">
                      Loading {recordType} records...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={recordType === 'allowance' ? 8 : 9} className="text-center py-8">
                      {fromDate && toDate ? `No ${recordType} records found for the selected date range` : `Select date range and click search to view ${recordType} records`}
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record, index) => (
                    <TableRow key={record._id} className={index % 2 === 1 ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      {isAllowanceRecord(record) ? (
                        <>
                          <TableCell>{record.allowanceType}</TableCell>
                          <TableCell className="font-medium">₹{record.amount}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.shift}</TableCell>
                          <TableCell>{record.department}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{record.building}</TableCell>
                          <TableCell>{record.nature}</TableCell>
                          <TableCell className="font-medium">₹{record.amount}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.shift}</TableCell>
                          <TableCell>{record.producedQty}</TableCell>
                          <TableCell>{record.norms}</TableCell>
                        </>
                      )}
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
