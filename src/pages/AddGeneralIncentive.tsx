
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';

interface Building {
  _id: string;
  buildingName: string;
  isDeleted: boolean;
}

interface SelectedBuilding extends Building {
  amount: number;
}

const AddGeneralIncentive = () => {
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [buildingAmounts, setBuildingAmounts] = useState<{ [key: string]: number }>({});
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productionDate, setProductionDate] = useState('');
  
  const { toast } = useToast();

  // Load buildings on component mount
  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    setIsLoadingBuildings(true);
    console.log('Fetching buildings...');
    
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
        console.log('Buildings data:', data);
        setBuildings(data.data?.filter((building: Building) => !building.isDeleted) || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch buildings",
        });
      }
    } catch (error) {
      console.error('Fetch buildings error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoadingBuildings(false);
    }
  };

  const handleBuildingChange = (buildingId: string, checked: boolean) => {
    setSelectedBuildings(prev => {
      if (checked) {
        // Initialize amount to 0 when building is selected
        setBuildingAmounts(prevAmounts => ({
          ...prevAmounts,
          [buildingId]: 0
        }));
        return [...prev, buildingId];
      } else {
        // Remove amount when building is deselected
        setBuildingAmounts(prevAmounts => {
          const { [buildingId]: removed, ...rest } = prevAmounts;
          return rest;
        });
        return prev.filter(id => id !== buildingId);
      }
    });
  };

  const handleAmountChange = (buildingId: string, amount: number) => {
    setBuildingAmounts(prev => ({
      ...prev,
      [buildingId]: amount
    }));
  };

  const removeBuildingFromTable = (buildingId: string) => {
    setSelectedBuildings(prev => prev.filter(id => id !== buildingId));
    setBuildingAmounts(prev => {
      const { [buildingId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const getSelectedBuildingsText = () => {
    if (selectedBuildings.length === 0) return "Select buildings...";
    if (selectedBuildings.length === 1) {
      const building = buildings.find(b => b._id === selectedBuildings[0]);
      return building?.buildingName || "Select buildings...";
    }
    return `${selectedBuildings.length} buildings selected`;
  };

  const getSelectedBuildingsData = (): SelectedBuilding[] => {
    return selectedBuildings.map(buildingId => {
      const building = buildings.find(b => b._id === buildingId);
      return {
        ...building!,
        amount: buildingAmounts[buildingId] || 0
      };
    });
  };

  const handleSubmit = async () => {
    if (selectedBuildings.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select at least one building",
      });
      return;
    }

    if (!productionDate) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a production date",
      });
      return;
    }

    // Check if all selected buildings have amounts
    const hasEmptyAmounts = selectedBuildings.some(buildingId => 
      !buildingAmounts[buildingId] || buildingAmounts[buildingId] <= 0
    );

    if (hasEmptyAmounts) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter valid amounts for all selected buildings",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting general incentive data...');

    try {
      const authToken = sessionStorage.getItem('authToken');
      
      // Create incentive records for each selected building
      const incentiveData = selectedBuildings.map(buildingId => ({
        building_id: buildingId,
        amount: buildingAmounts[buildingId],
        production_date: productionDate,
        type: 'general_incentive'
      }));

      console.log('Creating general incentives:', incentiveData);

      // Note: This endpoint might need to be updated based on your actual API
      const response = await fetch(`${API_CONFIG.BASE_URL}/createGeneralIncentive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ incentives: incentiveData }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "General incentive records created successfully",
        });

        // Reset form
        setSelectedBuildings([]);
        setBuildingAmounts({});
        setProductionDate('');
      } else {
        throw new Error('Failed to create general incentive records');
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create general incentive records",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex space-x-4 border-b pb-4">
        <div className="border-b-2 border-blue-600 pb-2">
          <span className="text-blue-600 font-medium">ADD GENERAL INCENTIVE</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add General Incentive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Production Date */}
          <div>
            <Label htmlFor="productionDate">Production Date</Label>
            <Input
              id="productionDate"
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Building Selection */}
          <div>
            <Label>Select Buildings</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                >
                  <span className="truncate">{getSelectedBuildingsText()}</span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingBuildings ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading buildings...</div>
                  ) : buildings.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No buildings available</div>
                  ) : (
                    <div className="p-2">
                      {buildings.map((building) => (
                        <div key={building._id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
                          <Checkbox
                            id={building._id}
                            checked={selectedBuildings.includes(building._id)}
                            onCheckedChange={(checked) => handleBuildingChange(building._id, checked as boolean)}
                          />
                          <label
                            htmlFor={building._id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {building.buildingName}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Buildings with Amounts */}
          {selectedBuildings.length > 0 && (
            <div>
              <Label>Building Incentive Amounts</Label>
              <div className="border rounded-lg mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Building Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSelectedBuildingsData().map((building) => (
                      <TableRow key={building._id}>
                        <TableCell>{building.buildingName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={buildingAmounts[building._id] || ''}
                            onChange={(e) => handleAmountChange(building._id, Number(e.target.value))}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeBuildingFromTable(building._id)}
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
              disabled={isSubmitting || selectedBuildings.length === 0 || !productionDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : 'Save General Incentive'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddGeneralIncentive;
