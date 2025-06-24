
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const BulkUpload = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [masterType, setMasterType] = useState('');

  const masterTypes = [
    { value: 'building', label: 'Building Master' },
    { value: 'norms', label: 'Norms Master' },
    { value: 'shift', label: 'Shift Master' },
    { value: 'allowance', label: 'Allowance Master' },
    { value: 'employee', label: 'Employee Master' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !masterType) {
      toast({
        title: "Error",
        description: "Please select both a file and master type.",
        variant: "destructive"
      });
      return;
    }

    // Mock upload process
    toast({
      title: "Upload started",
      description: `Uploading ${selectedFile.name} for ${masterType} master...`
    });

    // Simulate upload progress
    setTimeout(() => {
      toast({
        title: "Upload completed",
        description: `Successfully uploaded ${selectedFile.name} to ${masterType} master.`
      });
      setSelectedFile(null);
      setMasterType('');
    }, 2000);
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
              disabled={!selectedFile || !masterType}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
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
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpload;
