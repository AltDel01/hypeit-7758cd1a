
import React from 'react';
import DashboardComponent from '@/components/dashboard/Dashboard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-brand-slate-50">
      <header className="bg-white border-b border-brand-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-brand-blue to-brand-teal rounded-lg flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="ml-2 text-lg font-semibold">BrandGen</span>
            </div>
            
            <div className="flex items-center">
              <button className="p-1 rounded-full text-brand-slate-600 hover:text-brand-slate-900 focus:outline-none">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              <div className="ml-4 relative flex items-center">
                <div className="h-8 w-8 rounded-full bg-brand-slate-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-brand-slate-600">JD</span>
                </div>
                <span className="ml-2 text-sm font-medium text-brand-slate-700 hidden md:block">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <DashboardComponent />
    </div>
  );
};

export default Dashboard;
