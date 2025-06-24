import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface Allowance {
  _id: string;
  allowence: string;
  shift: string;
  amount: number;
  isDeleted: boolean;
}

interface AllowanceFormProps {
  allowance?: Allowance | null;
  onSave: () => void;
  onCancel: () => void;
}

const AllowanceForm: React.FC<AllowanceFormProps> = ({ allowance, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    allowence: allowance?.allowence || "",
    shift: allowance?.shift || "",
    amount: allowance?.amount?.toString() || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShiftChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      shift: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    console.log('Submitting allowance form data:', formData);

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
        amount: parseFloat(formData.amount) || 0,
      };

      const isEditing = !!allowance;
      const url = isEditing 
        ? API_ENDPOINTS.UPDATE_ALLOWANCE(allowance._id)
        : API_ENDPOINTS.CREATE_ALLOWANCE;
      
      const method = isEditing ? 'PUT' : 'POST';
      
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
          description: `Allowance ${isEditing ? 'updated' : 'created'} successfully`,
        });
        
        onSave();
      } else {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to ${isEditing ? 'update' : 'create'} allowance`,
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
        <Label htmlFor="allowence">Allowance</Label>
        <Input
          id="allowence"
          name="allowence"
          value={formData.allowence}
          onChange={handleInputChange}
          required
          placeholder="Enter allowance name"
        />
      </div>

      <div>
        <Label htmlFor="shift">Shift</Label>
        <Select value={formData.shift} onValueChange={handleShiftChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select shift type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Day">Day</SelectItem>
            <SelectItem value="Night">Night</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleInputChange}
          required
          placeholder="Enter amount"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (allowance ? 'Updating...' : 'Creating...') : (allowance ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default AllowanceForm;
