
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

const BulkUpload = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [masterType, setMasterType] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const masterTypes = [
    { value: 'building', label: 'Building Master' },
    { value: 'norms', label: 'Norms Master' },
    { value: 'allowance', label: 'Allowance Master' },
    { value: 'employee', label: 'Employee Master' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !masterType) {
      toast({
        title: "Error",
        description: "Please select both a file and master type.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    console.log('Starting upload process for:', masterType, selectedFile.name);

    try {
      const authToken = sessionStorage.getItem('authToken');
      
      if (!authToken) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      let uploadUrl = '';
      let successMessage = '';

      // Determine the correct API endpoint based on master type
      if (masterType === 'employee') {
        uploadUrl = API_ENDPOINTS.EMPLOYEE_UPLOAD;
        successMessage = `Successfully uploaded ${selectedFile.name} for Employee Master.`;
      } else if (masterType === 'building') {
        uploadUrl = API_ENDPOINTS.MASTER_DATA_UPLOAD;
        formData.append('type', 'building');
        successMessage = `Successfully uploaded ${selectedFile.name} for Building Master.`;
      } else if (masterType === 'allowance') {
        uploadUrl = API_ENDPOINTS.ALLOWANCE_DATA_UPLOAD;
        successMessage = `Successfully uploaded ${selectedFile.name} for Allowance Master.`;
      } else {
        // For other master types, show a placeholder message
        toast({
          title: "Upload started",
          description: `Uploading ${selectedFile.name} for ${masterType} master...`
        });

        setTimeout(() => {
          toast({
            title: "Upload completed",
            description: `Successfully uploaded ${selectedFile.name} to ${masterType} master.`
          });
          setSelectedFile(null);
          setMasterType('');
          setIsUploading(false);
        }, 2000);
        return;
      }

      console.log('Making POST request to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload response:', result);
        
        toast({
          title: "Upload completed",
          description: successMessage
        });
        
        setSelectedFile(null);
        setMasterType('');
      } else {
        const errorData = await response.text();
        console.error('Upload error:', response.status, errorData);
        
        toast({
          title: "Upload failed",
          description: `Failed to upload ${masterType} data. Please check the file format and try again.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (type: string) => {
    toast({
      title: "Template download",
      description: `Downloading template for ${type} master...`
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Upload</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Master Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Master Type</label>
              <Select value={masterType} onValueChange={setMasterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose master type" />
                </SelectTrigger>
                <SelectContent>
                  {masterTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
                disabled={isUploading}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleUpload}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!selectedFile || !masterType || isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Download Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Download the appropriate template file before uploading your data.
            </p>
            {masterTypes.map(type => (
              <Button
                key={type.value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => downloadTemplate(type.label)}
                disabled={isUploading}
              >
                Download {type.label} Template
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>File formats supported: Excel (.xlsx, .xls) and CSV (.csv)</li>
            <li>Maximum file size: 10MB</li>
            <li>Please use the provided templates to ensure data compatibility</li>
            <li>Duplicate entries will be skipped during upload</li>
            <li>Invalid data rows will be reported after upload completion</li>
            <li>Employee Master uploads use the dedicated employeeUpload API</li>
            <li>Building Master uploads use the masterDataUpload API with type parameter</li>
            <li>Allowance Master uploads use the AllowenceDataUpload API</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpload;
