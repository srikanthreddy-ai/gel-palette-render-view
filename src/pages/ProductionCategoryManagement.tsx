
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import BuildingForm from '@/components/BuildingForm';

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

const ProductionCategoryManagement = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const { toast } = useToast();

  const fetchBuildings = async () => {
    setIsLoading(true);
    console.log('Fetching buildings...');
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');
      
      const response = await fetch('https://pel-gel-backend.onrender.com/v1/api/ProductionDept', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        // Filter out deleted buildings
        setBuildings(data.data?.filter((building: Building) => !building.isDeleted) || []);
      } else {
        console.error('API Error:', response.status, response.statusText);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setIsDialogOpen(true);
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsDialogOpen(true);
  };

  const handleBuildingSaved = () => {
    setIsDialogOpen(false);
    setEditingBuilding(null);
    fetchBuildings();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingBuilding(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Production Category Management</CardTitle>
          <Button onClick={handleAddBuilding} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            ADD
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white">
                  <TableHead className="text-white font-bold">#</TableHead>
                  <TableHead className="text-white font-bold">Building Code</TableHead>
                  <TableHead className="text-white font-bold">Building Name</TableHead>
                  <TableHead className="text-white font-bold">Description</TableHead>
                  <TableHead className="text-white font-bold">Start/End Date</TableHead>
                  <TableHead className="text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading buildings...
                    </TableCell>
                  </TableRow>
                ) : buildings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No buildings found
                    </TableCell>
                  </TableRow>
                ) : (
                  buildings.map((building, index) => (
                    <TableRow key={building._id} className={index % 2 === 1 ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{building.buildingCode}</TableCell>
                      <TableCell>{building.buildingName}</TableCell>
                      <TableCell>{building.description}</TableCell>
                      <TableCell>
                        {formatDate(building.startDate)} - {formatDate(building.endDate)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleEditBuilding(building)}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          EDIT
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBuilding ? 'Edit Building' : 'New Building'}
            </DialogTitle>
          </DialogHeader>
          <BuildingForm
            building={editingBuilding}
            onSave={handleBuildingSaved}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionCategoryManagement;
