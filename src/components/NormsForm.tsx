
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface Building {
  _id: string;
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  description: string;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
}

interface ProductionNature {
  _id: string;
  building_id: {
    _id: string;
    buildingName: string;
    buildingCode: string;
  };
  productionNature: string;
  productionType: string;
  productionCode: string;
  manpower: number;
  norms: number;
  incentives: Array<{
    amount: number | null;
    each: number | null;
    min?: number | null;
    max?: number | null;
  }>;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
}

interface NormsFormProps {
  norm?: ProductionNature | null;
  onSave: () => void;
  onCancel: () => void;
}

const NormsForm: React.FC<NormsFormProps> = ({ norm, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    building_id: "",
    productionNature: "",
    productionType: "",
    productionCode: "",
    manpower: "",
    norms: "",
    startDate: "",
    endDate: "",
    incentives: [],
  });
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (norm) {
      setFormData({
        building_id: norm.building_id?._id || "",
        productionNature: norm.productionNature || "",
        productionType: norm.productionType || "",
        productionCode: norm.productionCode || "",
        manpower: norm.manpower?.toString() || "",
        norms: norm.norms?.toString() || "",
        startDate: norm.startDate ? new Date(norm.startDate).toISOString().split('T')[0] : "",
        endDate: norm.endDate ? new Date(norm.endDate).toISOString().split('T')[0] : "",
        incentives: norm.incentives || [],
      });
    } else {
      setFormData({
        building_id: "",
        productionNature: "",
        productionType: "",
        productionCode: "",
        manpower: "",
        norms: "",
        startDate: "",
        endDate: "",
        incentives: [],
      });
    }
  }, [norm]);

  const fetchBuildings = async () => {
    setIsBuildingsLoading(true);
    console.log('Fetching buildings for dropdown...');
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      
      if (!authToken) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication token not found",
        });
        return;
      }

      const response = await fetch('https://pel-gel-backend.onrender.com/v1/api/ProductionDept', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Buildings response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Buildings data:', data);
        // Filter out deleted buildings
        setBuildings(data.data?.filter((building: Building) => !building.isDeleted) || []);
      } else {
        console.error('Buildings API Error:', response.status, response.statusText);
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
      setIsBuildingsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      building_id: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting norms form data:', formData);

    try {
      const authToken = sessionStorage.getItem('authToken');
      
      if (!authToken) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication token not found",
        });
        return;
      }

      // Prepare the payload
      const payload = {
        ...formData,
        manpower: parseInt(formData.manpower) || 0,
        norms: parseInt(formData.norms) || 0,
      };

      const url = norm 
        ? `https://pel-gel-backend.onrender.com/v1/api/ProductionNature/${norm._id}`
        : 'https://pel-gel-backend.onrender.com/v1/api/ProductionNature';
      
      const method = norm ? 'PUT' : 'POST';
      
      console.log(`Making ${method} request to:`, url);
      console.log('Payload:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        toast({
          title: "Success",
          description: norm ? "Norms updated successfully" : "Norms created successfully",
        });
        
        onSave();
      } else {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to ${norm ? 'update' : 'create'} norms`,
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="building_id">Building</Label>
        <Select value={formData.building_id} onValueChange={handleSelectChange} disabled={isBuildingsLoading}>
          <SelectTrigger>
            <SelectValue placeholder={isBuildingsLoading ? "Loading buildings..." : "Select a building"} />
          </SelectTrigger>
          <SelectContent>
            {buildings.map((building) => (
              <SelectItem key={building._id} value={building._id}>
                {building.buildingName} ({building.buildingCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productionNature">Production Nature</Label>
          <Input
            id="productionNature"
            name="productionNature"
            value={formData.productionNature}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="productionType">Production Type</Label>
          <Input
            id="productionType"
            name="productionType"
            value={formData.productionType}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="productionCode">Production Code</Label>
        <Input
          id="productionCode"
          name="productionCode"
          value={formData.productionCode}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manpower">Manpower</Label>
          <Input
            id="manpower"
            name="manpower"
            type="number"
            value={formData.manpower}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="norms">Norms</Label>
          <Input
            id="norms"
            name="norms"
            type="number"
            value={formData.norms}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isBuildingsLoading}>
          {isLoading ? 'Saving...' : (norm ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default NormsForm;
