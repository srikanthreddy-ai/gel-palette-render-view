
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
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
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
}

const ProductionIncentiveEntry = () => {
  const [productionDate, setProductionDate] = useState<Date | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedNature, setSelectedNature] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [buildings, setBuildings] = useState<NatureCategory[]>([]);
  const [natures, setNatures] = useState<NatureCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const baseURL = 'http://localhost:5000/v1/api';

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
                isDeleted: false
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
              <Select value={selectedNature} onValueChange={setSelectedNature} disabled={isLoading}>
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
              <Select value={selectedShift} onValueChange={setSelectedShift} disabled={isLoading}>
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

          {/* Search Customer */}
          <div className="space-y-2 mb-6">
            <Label>Search Customer</Label>
            <Input
              placeholder="Start typing customer name..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full"
            />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionIncentiveEntry;
