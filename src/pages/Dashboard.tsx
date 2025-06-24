
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Employee Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">20</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Present Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">15</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">5</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Production Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-600 text-white">
            <CardHeader>
              <CardTitle className="text-center">Total Units Planned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">500</div>
            </CardContent>
          </Card>
          
          <Card className="bg-cyan-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Units Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">350</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500 text-white">
            <CardHeader>
              <CardTitle className="text-center">Pending Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">150</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
