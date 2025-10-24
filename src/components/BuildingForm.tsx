
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/api';

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

interface BuildingFormProps {
  building?: Building | null;
  onSave: () => void;
  onCancel: () => void;
}

const BuildingForm: React.FC<BuildingFormProps> = ({ building, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    buildingId: "",
    buildingName: "",
    buildingCode: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (building) {
      setFormData({
        buildingId: building.buildingId || "",
        buildingName: building.buildingName || "",
        buildingCode: building.buildingCode || "",
        description: building.description || "",
        startDate: building.startDate ? new Date(building.startDate).toISOString().split('T')[0] : "",
        endDate: building.endDate ? new Date(building.endDate).toISOString().split('T')[0] : "",
      });
    } else {
      setFormData({
        buildingId: "",
        buildingName: "",
        buildingCode: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [building]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting form data:', formData);

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

      const url = building 
        ? `${API_CONFIG.BASE_URL}/ProductionDept/${building._id}`
        : `${API_CONFIG.BASE_URL}/ProductionDept`;
      
      const method = building ? 'PUT' : 'POST';
      
      console.log(`Making ${method} request to:`, url);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        toast({
          title: "Success",
          description: building ? "Building updated successfully" : "Building created successfully",
        });
        
        onSave();
      } else {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to ${building ? 'update' : 'create'} building`,
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buildingId">Building ID</Label>
          <Input
            id="buildingId"
            name="buildingId"
            value={formData.buildingId}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="buildingCode">Building Code</Label>
          <Input
            id="buildingCode"
            name="buildingCode"
            value={formData.buildingCode}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="buildingName">Building Name</Label>
        <Input
          id="buildingName"
          name="buildingName"
          value={formData.buildingName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
        />
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (building ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default BuildingForm;
