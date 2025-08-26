import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/api';

const Dashboard = () => {
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [workedYesterday, setWorkedYesterday] = useState<number>(0);
  const [totalBuildingsPlanned, setTotalBuildingsPlanned] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployeeCount = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Fetching employee count...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/employeesList`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Employee count response:', data);
        console.log('Total items from API:', data.totalItems);
        setTotalEmployees(data.totalItems || 0);
      } else {
        console.error('Failed to fetch employee count:', response.status);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch employee count",
        });
      }
    } catch (error) {
      console.error('Error fetching employee count:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    }
  };

  const fetchTotalBuildingsPlanned = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      console.log('Fetching total buildings planned...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/ProductionDept`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Production departments response:', data);
        setTotalBuildingsPlanned(data.data?.length || 0);
      } else {
        console.error('Failed to fetch production departments:', response.status);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch production departments",
        });
      }
    } catch (error) {
      console.error('Error fetching production departments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect to the server",
      });
    }
  };

  const fetchWorkedYesterday = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      
      // Calculate yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      console.log('Fetching worked yesterday count for date:', yesterdayDate);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/getAllTimeSheets?date=${yesterdayDate}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Timesheet response:', data);
        setWorkedYesterday(data.totalItems || data.data?.length || 0);
      } else {
        console.error('Failed to fetch timesheet data:', response.status);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch timesheet data",
        });
      }
    } catch (error) {
      console.error('Error fetching timesheet data:', error);
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
    fetchEmployeeCount();
    fetchTotalBuildingsPlanned();
    fetchWorkedYesterday();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Employee Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">
                {isLoading ? '...' : totalEmployees}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Worked Yesterday</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">
                {isLoading ? '...' : workedYesterday}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Production Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-600 text-white">
            <CardHeader>
              <CardTitle className="text-center">Total Buildings Planned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">
                {isLoading ? '...' : totalBuildingsPlanned}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-cyan-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Buildings Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">
                {isLoading ? '...' : totalBuildingsPlanned}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Pending Buildings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">
                {isLoading ? '...' : totalBuildingsPlanned}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
