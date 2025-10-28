import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Building } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface BuildingData {
  _id: string;
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  description: string;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
  __v: number;
}

interface BuildingOption {
  id: string;
  name: string;
}

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [buildingOptions, setBuildingOptions] = useState<BuildingOption[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const { toast } = useToast();

  const reportOptions = [
    { value: 'allowance-incentive', label: 'Allowance & Incentive Report' },
    { value: 'staff', label: 'Staff Report' },
    { value: 'production', label: 'Production Report' }
  ];

  const reportTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' }
  ];

  const reportPeriodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  const isAllowanceOrIncentive = selectedReport === 'allowance-incentive';

  // Fetch buildings when component mounts or when allowance/incentive is selected
  useEffect(() => {
    if (isAllowanceOrIncentive) {
      fetchBuildings();
    }
  }, [isAllowanceOrIncentive]);

  const fetchBuildings = async () => {
    setIsLoadingBuildings(true);
    try {
      const authToken = sessionStorage.getItem('authToken');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(API_ENDPOINTS.PRODUCTION_DEPT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch buildings');
      }

      const apiResponse = await response.json();
      console.log('Buildings data:', apiResponse);
      
      if (apiResponse.status && Array.isArray(apiResponse.data)) {
        // Filter out deleted buildings and map to our format
        const activeBuildings = apiResponse.data
          .filter((building: BuildingData) => !building.isDeleted)
          .map((building: BuildingData) => ({
            id: building._id, // Use _id instead of buildingId
            name: `${building.buildingName} (${building.buildingCode})`
          }));
        
        // Add "All Buildings" option at the beginning
        const buildingsWithAll = [
          { id: 'all', name: 'All Buildings' },
          ...activeBuildings
        ];
        
        setBuildingOptions(buildingsWithAll);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast({
        title: "Error",
        description: "Failed to load buildings",
        variant: "destructive"
      });
      // Fallback to default options
      setBuildingOptions([{ id: 'all', name: 'All Buildings' }]);
    } finally {
      setIsLoadingBuildings(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedReport || !reportType || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select all required fields",
        variant: "destructive"
      });
      return;
    }

    if (isAllowanceOrIncentive && !reportPeriod) {
      toast({
        title: "Missing Information",
        description: "Please select report period for allowance/incentive reports",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive"
        });
        return;
      }

      // Determine the report value to send to API
      let reportValue = selectedReport;
      if (selectedReport === 'allowance-incentive') {
        reportValue = 'allowence'; // Note: using 'allowence' as specified, also sending 'incentive'
      }

      const params = new URLSearchParams({
        report: reportValue,
        type: reportType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      // Add incentive as additional report parameter for allowance-incentive
      if (selectedReport === 'allowance-incentive') {
        params.append('report', 'incentive');
      }

      // Add additional parameters for allowance/incentive reports
      if (isAllowanceOrIncentive) {
        params.append('period', reportPeriod);
        if (selectedBuilding) {
          params.append('building', selectedBuilding);
        }
      }

      const response = await fetch(`${API_ENDPOINTS.DOWNLOAD_REPORT}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let filename = `${selectedReport}_report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
      if (isAllowanceOrIncentive) {
        filename += `_${reportPeriod}`;
        if (selectedBuilding) {
          filename += `_${selectedBuilding}`;
        }
      }
      filename += `.${reportType}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report downloaded successfully"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600">Download reports for different date ranges, periods, and buildings</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Report</label>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a report type" />
              </SelectTrigger>
              <SelectContent>
                {reportOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Period - Only for Allowance and Incentive reports */}
          {isAllowanceOrIncentive && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Period</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose report period" />
                </SelectTrigger>
                <SelectContent>
                  {reportPeriodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Building Selection - Only for Allowance and Incentive reports */}
          {isAllowanceOrIncentive && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Building</label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingBuildings ? "Loading buildings..." : "Choose building"} />
                </SelectTrigger>
                <SelectContent>
                  {buildingOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <Building className="mr-2 h-4 w-4 inline" />
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Format</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose format" />
              </SelectTrigger>
              <SelectContent>
                {reportTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Download Button */}
          <Button 
            onClick={handleDownload} 
            disabled={
              !selectedReport || 
              !reportType || 
              !startDate || 
              !endDate || 
              isDownloading ||
              (isAllowanceOrIncentive && !reportPeriod)
            }
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download Report'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
