
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Shift {
  _id: string;
  shiftName: string;
  shiftHrs: number;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
}

interface ShiftFormProps {
  shift?: Shift | null;
  onSave: () => void;
  onCancel: () => void;
}

const ShiftForm: React.FC<ShiftFormProps> = ({ shift, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    shiftName: "",
    shiftHrs: "",
    startTime: "",
    endTime: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Shift prop changed:', shift);
    
    if (shift) {
      const formDataToSet = {
        shiftName: shift.shiftName || "",
        shiftHrs: shift.shiftHrs?.toString() || "",
        startTime: shift.startTime || "",
        endTime: shift.endTime || "",
      };
      
      console.log('Setting form data for edit:', formDataToSet);
      setFormData(formDataToSet);
    } else {
      console.log('Resetting form for new shift');
      setFormData({
        shiftName: "",
        shiftHrs: "",
        startTime: "",
        endTime: "",
      });
    }
  }, [shift]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    console.log('Submitting shift form data:', formData);

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

      const payload = {
        ...formData,
        shiftHrs: parseInt(formData.shiftHrs) || 0,
      };

      const url = shift 
        ? `https://pel-gel-backend.onrender.com/v1/api/ProductionShift/${shift._id}`
        : 'https://pel-gel-backend.onrender.com/v1/api/ProductionShift';
      
      const method = shift ? 'PUT' : 'POST';
      
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
          description: shift ? "Shift updated successfully" : "Shift created successfully",
        });
        
        onSave();
      } else {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to ${shift ? 'update' : 'create'} shift`,
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
        <Label htmlFor="shiftName">Shift Name</Label>
        <Input
          id="shiftName"
          name="shiftName"
          value={formData.shiftName}
          onChange={handleInputChange}
          required
          placeholder="Enter shift name"
        />
      </div>

      <div>
        <Label htmlFor="shiftHrs">Shift Hours</Label>
        <Input
          id="shiftHrs"
          name="shiftHrs"
          type="number"
          value={formData.shiftHrs}
          onChange={handleInputChange}
          required
          placeholder="Enter shift hours"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            value={formData.endTime}
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
          {isLoading ? 'Saving...' : (shift ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default ShiftForm;
