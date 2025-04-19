
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Plus, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DashboardHeader = () => {
  const { user } = useAuth();
  // In a real app, you would check user roles
  const isAdmin = !!user; // For demo purposes, all logged-in users are admins
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-1 text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's an overview of your HYPEIT activity.</p>
      </div>
      <div className="mt-4 md:mt-0 flex space-x-3">
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
          <Clock className="mr-2 h-4 w-4" />
          View History
        </Button>
        <Button className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white hover:shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          New Creation
        </Button>
        {isAdmin && (
          <Link to="/admin">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Area
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
