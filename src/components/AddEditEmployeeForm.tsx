
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

interface Employee {
  id?: string;
  employeeCode?: string;
  name?: string;
  designation?: string;
  department?: string;
  email?: string;
}

interface AddEditEmployeeFormProps {
  employee?: Employee | null;
  onSave: () => void;
  onCancel: () => void;
}

const AddEditEmployeeForm: React.FC<AddEditEmployeeFormProps> = ({
  employee,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    department: '',
    cader: '',
    employeeCode: '',
    designation: '',
    pfNumber: '',
    uanNumber: '',
    sonDaughterOf: '',
    dateOfBirth: null as Date | null,
    dateOfJoining: null as Date | null,
    dateOfProbation: null as Date | null,
    basicSalary: '',
    hra: '',
    ca: '',
    sa: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (employee) {
      // Populate form with existing employee data
      setFormData(prev => ({
        ...prev,
        employeeCode: employee.employeeCode || '',
        firstName: employee.name || '',
        email: employee.email || '',
        designation: employee.designation || '',
        department: employee.department || '',
      }));
    }
  }, [employee]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authToken = sessionStorage.getItem('authToken');
      const url = employee?.id 
        ? `https://pel-gel-backend.onrender.com/v1/api/employee/${employee.id}`
        : 'https://pel-gel-backend.onrender.com/v1/api/employee';
      
      const method = employee?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Employee ${employee?.id ? 'updated' : 'created'} successfully`,
        });
        onSave();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || `Failed to ${employee?.id ? 'update' : 'create'} employee`,
        });
      }
    } catch (error) {
      console.error('Save employee error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const DatePicker = ({ field, label }: { field: string; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !formData[field as keyof typeof formData] && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData[field as keyof typeof formData] ? 
              format(formData[field as keyof typeof formData] as Date, "dd-MM-yyyy") : 
              "dd-mm-yyyy"
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formData[field as keyof typeof formData] as Date}
            onSelect={(date) => handleDateChange(field, date)}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Middle Name</Label>
            <Input
              value={formData.middleName}
              onChange={(e) => handleInputChange('middleName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Department</Label>
            <Input
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Cader</Label>
            <Input
              value={formData.cader}
              onChange={(e) => handleInputChange('cader', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Employee Code</Label>
            <Input
              value={formData.employeeCode}
              onChange={(e) => handleInputChange('employeeCode', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>PF Number</Label>
            <Input
              value={formData.pfNumber}
              onChange={(e) => handleInputChange('pfNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="space-y-2">
            <Label>UAN Number</Label>
            <Input
              value={formData.uanNumber}
              onChange={(e) => handleInputChange('uanNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Son/Daughter Of</Label>
            <Input
              value={formData.sonDaughterOf}
              onChange={(e) => handleInputChange('sonDaughterOf', e.target.value)}
            />
          </div>
          <DatePicker field="dateOfBirth" label="Date of Birth" />
          <DatePicker field="dateOfJoining" label="Date of Joining" />
          <DatePicker field="dateOfProbation" label="Date of Probation" />
        </div>
      </div>

      {/* Salary Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Salary Details</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Basic</Label>
            <Input
              type="number"
              value={formData.basicSalary}
              onChange={(e) => handleInputChange('basicSalary', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>HRA</Label>
            <Input
              type="number"
              value={formData.hra}
              onChange={(e) => handleInputChange('hra', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>CA</Label>
            <Input
              type="number"
              value={formData.ca}
              onChange={(e) => handleInputChange('ca', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>SA</Label>
            <Input
              type="number"
              value={formData.sa}
              onChange={(e) => handleInputChange('sa', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Account Holder Name</Label>
            <Input
              value={formData.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>IFSC Code</Label>
            <Input
              value={formData.ifscCode}
              onChange={(e) => handleInputChange('ifscCode', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          CANCEL
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : employee?.id ? "UPDATE" : "ADD"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditEmployeeForm;
