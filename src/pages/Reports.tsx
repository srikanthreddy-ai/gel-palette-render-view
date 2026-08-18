import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  CalendarIcon,
  Download,
  Building,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface BuildingData {
  _id: string;
  buildingName: string;
  buildingCode: string;
  isDeleted: boolean;
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
    {
      value: 'EmployeeAllowences',
      label: 'Allowance Report',
    },
    {
      value: 'productionIncentives',
      label: 'Production Incentive Report',
    },
    {
      value: 'buildingwiseIncentives',
      label: 'Building-wise Incentive Report',
    },
  ];


  const reportTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
  ];

  const reportPeriodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom Date Range' },
  ];

  // Building field only for Building-wise Incentive
  const isBuildingWise =
    selectedReport === 'building-wise-incentive';

  // Fetch buildings only when Building-wise Incentive is selected
  useEffect(() => {
    if (isBuildingWise) {
      fetchBuildings();
    } else {
      setSelectedBuilding('');
      setBuildingOptions([]);
    }
  }, [isBuildingWise]);

  const fetchBuildings = async () => {
    setIsLoadingBuildings(true);

    try {
      const authToken = sessionStorage.getItem('authToken');

      if (!authToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please login again',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(
        API_ENDPOINTS.PRODUCTION_DEPT,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch buildings');
      }

      const apiResponse = await response.json();

      if (
        apiResponse.status &&
        Array.isArray(apiResponse.data)
      ) {
        const activeBuildings = apiResponse.data
          .filter(
            (building: BuildingData) =>
              !building.isDeleted
          )
          .map((building: BuildingData) => ({
            id: building._id,
            name: `${building.buildingName} (${building.buildingCode})`,
          }));

        setBuildingOptions(activeBuildings);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);

      toast({
        title: 'Error',
        description: 'Failed to load buildings',
        variant: 'destructive',
      });

      setBuildingOptions([]);
    } finally {
      setIsLoadingBuildings(false);
    }
  };

  const handleReportChange = (value: string) => {
    setSelectedReport(value);

    // Clear building when switching away
    if (value !== 'building-wise-incentive') {
      setSelectedBuilding('');
    }

    // Reset period when changing report
    setReportPeriod('');
  };

  const handleDownload = async () => {
    if (
      !selectedReport ||
      !reportType ||
      !reportPeriod ||
      !startDate ||
      !endDate
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please select all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (isBuildingWise && !selectedBuilding) {
      toast({
        title: 'Missing Information',
        description: 'Please select a building',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);

    try {
      const authToken = sessionStorage.getItem('authToken');

      if (!authToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please login again',
          variant: 'destructive',
        });
        return;
      }

      const params = new URLSearchParams({
        report: selectedReport,
        type: reportType,
        period: reportPeriod,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });

      // Add building only for Building-wise Incentive
      if (isBuildingWise && selectedBuilding) {
        params.append('building', selectedBuilding);
      }

      const response = await fetch(
        `${API_ENDPOINTS.DOWNLOAD_REPORT}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;

      let filename = `${selectedReport}_report_${format(
        startDate,
        'yyyy-MM-dd'
      )}_to_${format(endDate, 'yyyy-MM-dd')}_${reportPeriod}`;

      if (isBuildingWise && selectedBuilding) {
        filename += `_${selectedBuilding}`;
      }

      filename += `.${reportType}`;

      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
      });
    } catch (error) {
      console.error('Download error:', error);

      toast({
        title: 'Error',
        description: 'Failed to download report',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-6 py-10">

      {/* Page Header */}
      <div className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-3xl font-bold">
          Reports
        </h1>

        <p className="mt-2 text-gray-600">
          Download reports for different periods and date ranges
        </p>
      </div>

      {/* Report Card */}
      <Card className="w-full max-w-4xl shadow-md">
        <CardContent className="space-y-6 p-8">

          {/* Report */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Report
            </label>

            <Select
              value={selectedReport}
              onValueChange={handleReportChange}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a report" />
              </SelectTrigger>

              <SelectContent>
                {reportOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Period */}
          {selectedReport && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Report Period
              </label>

              <Select
                value={reportPeriod}
                onValueChange={setReportPeriod}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose report period" />
                </SelectTrigger>

                <SelectContent>
                  {reportPeriodOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Building - Only Building-wise Incentive */}
          {isBuildingWise && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selected Building
              </label>

              <Select
                value={selectedBuilding}
                onValueChange={setSelectedBuilding}
                disabled={isLoadingBuildings}
              >
                <SelectTrigger className="h-11">
                  <SelectValue
                    placeholder={
                      isLoadingBuildings
                        ? 'Loading buildings...'
                        : 'Choose building'
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {buildingOptions.map((building) => (
                    <SelectItem
                      key={building.id}
                      value={building.id}
                    >
                      <Building className="mr-2 inline h-4 w-4" />
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Report Format */}
          {selectedReport && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Report Format
              </label>

              <Select
                value={reportType}
                onValueChange={setReportType}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose format" />
                </SelectTrigger>

                <SelectContent>
                  {reportTypeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          {selectedReport && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Start Date
                </label>

                <Popover
                  open={startDateOpen}
                  onOpenChange={setStartDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-11 w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {startDate
                        ? format(startDate, 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  End Date
                </label>

                <Popover
                  open={endDateOpen}
                  onOpenChange={setEndDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-11 w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {endDate
                        ? format(endDate, 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndDateOpen(false);
                      }}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Download */}
          {selectedReport && (
            <Button
              onClick={handleDownload}
              disabled={
                !reportPeriod ||
                !reportType ||
                !startDate ||
                !endDate ||
                isDownloading ||
                (isBuildingWise && !selectedBuilding)
              }
              className="h-11 w-full"
            >
              <Download className="mr-2 h-4 w-4" />

              {isDownloading
                ? 'Downloading...'
                : 'Download Report'}
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );

};

export default Reports;