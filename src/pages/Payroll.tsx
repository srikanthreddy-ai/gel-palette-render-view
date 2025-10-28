import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { API_CONFIG } from '@/config/api';

interface PayrollRecord {
  employeeId: string;
  employeeName: string;
  buildingName: string;
  natureName: string;
  productionDate: string;
  workedHrs: number;
  shiftHrs: number;
  amount: number;
  type: 'allowance' | 'incentive';
}

const Payroll = () => {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
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

    try {
      const authToken = sessionStorage.getItem('authToken');
      
      // Fetch allowances
      const allowanceResponse = await fetch(
        `${API_CONFIG.BASE_URL}/getEmpAllowences?fromDate=${fromDateStr}&toDate=${toDateStr}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Fetch incentives
      const incentiveResponse = await fetch(
        `${API_CONFIG.BASE_URL}/getAllTimeSheets?fromDate=${fromDateStr}&toDate=${toDateStr}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (allowanceResponse.ok && incentiveResponse.ok) {
        const allowanceData = await allowanceResponse.json();
        const incentiveData = await incentiveResponse.json();

        const records: PayrollRecord[] = [];

        // Process allowances
        (allowanceData.data || []).forEach((record: any) => {
          records.push({
            employeeId: record.empCode || 'N/A',
            employeeName: record.employee_id?.fullName || 'Unknown',
            buildingName: record.building_id?.buildingName || 'N/A',
            natureName: 'N/A',
            productionDate: record.productionDate ? format(new Date(record.productionDate), 'dd-MM-yyyy') : 'N/A',
            workedHrs: 0,
            shiftHrs: 0,
            amount: parseFloat(record.amount) || 0,
            type: 'allowance',
          });
        });

        // Process incentives
        (incentiveData.data || []).forEach((record: any) => {
          records.push({
            employeeId: record.employeeCode || record.empCode || 'N/A',
            employeeName: record.employee_id?.fullName || 'Unknown',
            buildingName: record.building_id?.buildingName || 'N/A',
            natureName: record.nature_id?.productionNature || 'N/A',
            productionDate: record.productionDate ? format(new Date(record.productionDate), 'dd-MM-yyyy') : 'N/A',
            workedHrs: record.workedHrs || 0,
            shiftHrs: record.shiftHrs || 0,
            amount: parseFloat(record.incentiveAmount) || 0,
            type: 'incentive',
          });
        });

        setPayrollRecords(records);
        setCurrentPage(1);

        if (records.length === 0) {
          toast({
            title: "No Records Found",
            description: "No payroll records found for the selected date range",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch payroll records",
        });
      }
    } catch (error) {
      console.error('Fetch payroll records error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (payrollRecords.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No payroll data to download",
      });
      return;
    }

    // Create CSV content
    const headers = ['Employee ID', 'Employee Name', 'Building', 'Nature', 'Production Date', 'Worked Hrs', 'Shift Hrs', 'Amount', 'Type'];
    const csvRows = [headers.join(',')];

    payrollRecords.forEach(record => {
      const row = [
        record.employeeId,
        `"${record.employeeName}"`,
        `"${record.buildingName}"`,
        `"${record.natureName}"`,
        record.productionDate,
        record.workedHrs,
        record.shiftHrs,
        record.amount.toFixed(2),
        record.type,
      ];
      csvRows.push(row.join(','));
    });

    // Add totals row
    const totalAmount = payrollRecords.reduce((sum, r) => sum + r.amount, 0);
    csvRows.push(['', '', '', '', '', '', 'TOTAL', totalAmount.toFixed(2), ''].join(','));

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `payroll_report_${format(fromDate!, 'yyyy-MM-dd')}_to_${format(toDate!, 'yyyy-MM-dd')}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Payroll report downloaded successfully",
    });
  };

  const calculateTotals = () => {
    const totalAllowance = payrollRecords.filter(r => r.type === 'allowance').reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalIncentive = payrollRecords.filter(r => r.type === 'incentive').reduce((sum, r) => sum + (r.amount || 0), 0);
    return {
      totalAllowance,
      totalIncentive,
      totalPayroll: totalAllowance + totalIncentive,
    };
  };

  const totals = calculateTotals();

  // Pagination calculations
  const totalPages = Math.ceil(payrollRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = payrollRecords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Payroll Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="fromDate">From Date</Label>
              <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setFromDateOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="toDate">To Date</Label>
              <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setToDateOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Generate Report'}
              </Button>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={downloadCSV}
                disabled={payrollRecords.length === 0}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          {payrollRecords.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-green-800 font-medium block">Total Employees</span>
                  <span className="text-green-900 font-bold text-xl">{payrollRecords.length}</span>
                </div>
                <div>
                  <span className="text-green-800 font-medium block">Total Allowances</span>
                  <span className="text-green-900 font-bold text-xl">₹{totals.totalAllowance.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-green-800 font-medium block">Total Incentives</span>
                  <span className="text-green-900 font-bold text-xl">₹{totals.totalIncentive.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-green-800 font-medium block">Total Payroll</span>
                  <span className="text-green-900 font-bold text-xl">₹{totals.totalPayroll.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white">
                  <TableHead className="text-white font-bold">#</TableHead>
                  <TableHead className="text-white font-bold">Employee ID</TableHead>
                  <TableHead className="text-white font-bold">Employee Name</TableHead>
                  <TableHead className="text-white font-bold">Building</TableHead>
                  <TableHead className="text-white font-bold">Nature</TableHead>
                  <TableHead className="text-white font-bold">Production Date</TableHead>
                  <TableHead className="text-white font-bold">Worked Hrs</TableHead>
                  <TableHead className="text-white font-bold">Shift Hrs</TableHead>
                  <TableHead className="text-white font-bold">Amount</TableHead>
                  <TableHead className="text-white font-bold">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading payroll records...
                    </TableCell>
                  </TableRow>
                ) : payrollRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      {fromDate && toDate ? 'No payroll records found for the selected date range' : 'Select date range and click "Generate Report" to view payroll data'}
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {currentRecords.map((record, index) => (
                      <TableRow key={`${record.employeeId}-${index}`} className={index % 2 === 1 ? "bg-red-50" : ""}>
                        <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                        <TableCell className="font-medium">{record.employeeId}</TableCell>
                        <TableCell>{record.employeeName}</TableCell>
                        <TableCell>{record.buildingName}</TableCell>
                        <TableCell>{record.natureName}</TableCell>
                        <TableCell>{record.productionDate}</TableCell>
                        <TableCell className="text-center">{record.workedHrs}</TableCell>
                        <TableCell className="text-center">{record.shiftHrs}</TableCell>
                        <TableCell className="font-medium">₹{(record.amount || 0).toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{record.type}</TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-gray-800 text-white font-bold">
                      <TableCell colSpan={8} className="text-white font-bold text-right">TOTAL</TableCell>
                      <TableCell className="text-white font-bold">₹{(totals.totalAllowance + totals.totalIncentive).toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, payrollRecords.length)} of {payrollRecords.length} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;