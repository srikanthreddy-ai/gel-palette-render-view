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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AllowanceForm from '@/components/AllowanceForm';
import { API_CONFIG } from '@/config/api';

interface Allowance {
  _id: string;
  allowence: string;
  shift: string;
  amount: number;
  isDeleted: boolean;
}

const AllowanceManagement = () => {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<Allowance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageGroup, setPageGroup] = useState(0);
  const { toast } = useToast();
  
  const ITEMS_PER_PAGE = 10;
  const PAGES_PER_GROUP = 3;

  const fetchAllowances = async (page: number = currentPage) => {
    setIsLoading(true);
    console.log('Fetching allowances data for page:', page);
    
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Auth token:', authToken ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/getAllowences?page=${page}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        // Filter out deleted allowances
        const filteredAllowances = data.data?.filter((allowance: Allowance) => !allowance.isDeleted) || [];
        setAllowances(filteredAllowances);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } else {
        console.error('API Error:', response.status, response.statusText);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch allowances data",
        });
      }
    } catch (error) {
      console.error('Fetch allowances data error:', error);
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
    fetchAllowances();
  }, []);

  const handleAddAllowance = () => {
    setEditingAllowance(null);
    setIsDialogOpen(true);
  };

  const handleEditAllowance = (allowance: Allowance) => {
    setEditingAllowance(allowance);
    setIsDialogOpen(true);
  };

  const handleAllowanceSaved = () => {
    setIsDialogOpen(false);
    setEditingAllowance(null);
    fetchAllowances(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAllowances(page);
  };

  const renderPaginationItems = () => {
    const startPage = pageGroup * PAGES_PER_GROUP + 1;
    const endPage = Math.min(startPage + PAGES_PER_GROUP - 1, totalPages);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    
    return pages.map((page) => (
      <PaginationItem key={page}>
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(page);
          }}
          isActive={currentPage === page}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ));
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Allowance Management</CardTitle>
          <Button onClick={handleAddAllowance} className="bg-blue-600 hover:bg-blue-700">
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
                  <TableHead className="text-white font-bold">Allowance</TableHead>
                  <TableHead className="text-white font-bold">Shift</TableHead>
                  <TableHead className="text-white font-bold">Amount</TableHead>
                  <TableHead className="text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading allowances data...
                    </TableCell>
                  </TableRow>
                ) : allowances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No allowances data found
                    </TableCell>
                  </TableRow>
                ) : (
                  allowances.map((allowance, index) => (
                    <TableRow key={allowance._id} className={index % 2 === 1 ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                      <TableCell className="font-medium">{allowance.allowence}</TableCell>
                      <TableCell>{allowance.shift}</TableCell>
                      <TableCell>{allowance.amount}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleEditAllowance(allowance)}
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
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          const newPage = currentPage - 1;
                          handlePageChange(newPage);
                          const newGroup = Math.floor((newPage - 1) / PAGES_PER_GROUP);
                          setPageGroup(newGroup);
                        }
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const lastPageInGroup = Math.min((pageGroup + 1) * PAGES_PER_GROUP, totalPages);
                        
                        if (currentPage < totalPages) {
                          const newPage = currentPage + 1;
                          handlePageChange(newPage);
                          
                          if (newPage > lastPageInGroup) {
                            setPageGroup(pageGroup + 1);
                          }
                        }
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAllowance ? 'Edit Allowance' : 'New Allowance'}
            </DialogTitle>
          </DialogHeader>
          <AllowanceForm
            allowance={editingAllowance}
            onSave={handleAllowanceSaved}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllowanceManagement;
