import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Plus, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';

const DashboardHeader = () => {
  const { isAdmin, isLoading } = useAdminRole();
  
  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's an overview of your HYPEIT activity.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="flex-1 md:flex-none border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
          <Clock className="mr-2 h-4 w-4" />
          View History
        </Button>
        <Button className="flex-1 md:flex-none bg-[#8c52ff] hover:bg-[#7a45e6] text-white hover:shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          New Creation
        </Button>
        {!isLoading && isAdmin && (
          <Link to="/admin">
            <Button variant="outline" className="flex-1 md:flex-none border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
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
