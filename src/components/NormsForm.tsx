import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Minus } from 'lucide-react';

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
    incentives: [{ min: "", max: "", each: "", amount: "" }],
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
      // Format incentives for editing
      const formattedIncentives = norm.incentives && norm.incentives.length > 0 
        ? norm.incentives.map(incentive => ({
            min: incentive.min?.toString() || "",
            max: incentive.max?.toString() || "",
            each: incentive.each?.toString() || "",
            amount: incentive.amount?.toString() || "",
          }))
        : [{ min: "", max: "", each: "", amount: "" }];

      setFormData({
        building_id: norm.building_id?._id || "",
        productionNature: norm.productionNature || "",
        productionType: norm.productionType || "",
        productionCode: norm.productionCode || "",
        manpower: norm.manpower?.toString() || "",
        norms: norm.norms?.toString() || "",
        startDate: norm.startDate ? new Date(norm.startDate).toISOString().split('T')[0] : "",
        endDate: norm.endDate ? new Date(norm.endDate).toISOString().split('T')[0] : "",
        incentives: formattedIncentives,
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
        incentives: [{ min: "", max: "", each: "", amount: "" }],
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

  const handleIncentiveChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      incentives: prev.incentives.map((incentive, i) => 
        i === index ? { ...incentive, [field]: value } : incentive
      )
    }));
  };

  const addIncentive = () => {
    setFormData(prev => ({
      ...prev,
      incentives: [...prev.incentives, { min: "", max: "", each: "", amount: "" }]
    }));
  };

  const removeIncentive = (index: number) => {
    if (formData.incentives.length > 1) {
      setFormData(prev => ({
        ...prev,
        incentives: prev.incentives.filter((_, i) => i !== index)
      }));
    }
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

      // Prepare the payload with proper incentives formatting
      const formattedIncentives = formData.incentives.map(incentive => ({
        min: incentive.min ? parseInt(incentive.min) : null,
        max: incentive.max ? parseInt(incentive.max) : null,
        each: incentive.each ? parseInt(incentive.each) : null,
        amount: incentive.amount ? parseInt(incentive.amount) : null,
      }));

      const payload = {
        ...formData,
        manpower: parseInt(formData.manpower) || 0,
        norms: parseInt(formData.norms) || 0,
        incentives: formattedIncentives,
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

  // Get the selected building name for display
  const selectedBuilding = buildings.find(building => building._id === formData.building_id);
  const displayValue = selectedBuilding ? `${selectedBuilding.buildingName} (${selectedBuilding.buildingCode})` : 
    (norm?.building_id ? `${norm.building_id.buildingName} (${norm.building_id.buildingCode})` : "");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="building_id">Building</Label>
        <Select value={formData.building_id} onValueChange={handleSelectChange} disabled={isBuildingsLoading}>
          <SelectTrigger>
            <SelectValue placeholder={isBuildingsLoading ? "Loading buildings..." : "Select a building"}>
              {displayValue || (isBuildingsLoading ? "Loading buildings..." : "Select a building")}
            </SelectValue>
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

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Incentives</Label>
          <Button
            type="button"
            size="sm"
            onClick={addIncentive}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Incentive
          </Button>
        </div>
        
        {formData.incentives.map((incentive, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2 mb-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Incentive {index + 1}</h4>
              {formData.incentives.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeIncentive(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label htmlFor={`min-${index}`}>Min</Label>
                <Input
                  id={`min-${index}`}
                  type="number"
                  value={incentive.min}
                  onChange={(e) => handleIncentiveChange(index, 'min', e.target.value)}
                  placeholder="Min value"
                />
              </div>
              <div>
                <Label htmlFor={`max-${index}`}>Max</Label>
                <Input
                  id={`max-${index}`}
                  type="number"
                  value={incentive.max}
                  onChange={(e) => handleIncentiveChange(index, 'max', e.target.value)}
                  placeholder="Max value"
                />
              </div>
              <div>
                <Label htmlFor={`each-${index}`}>Each</Label>
                <Input
                  id={`each-${index}`}
                  type="number"
                  value={incentive.each}
                  onChange={(e) => handleIncentiveChange(index, 'each', e.target.value)}
                  placeholder="Each value"
                />
              </div>
              <div>
                <Label htmlFor={`amount-${index}`}>Amount</Label>
                <Input
                  id={`amount-${index}`}
                  type="number"
                  value={incentive.amount}
                  onChange={(e) => handleIncentiveChange(index, 'amount', e.target.value)}
                  placeholder="Amount"
                />
              </div>
            </div>
          </div>
        ))}
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
