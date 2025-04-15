
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Settings, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const FooterMenu = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 md:hidden">
      <nav className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1",
            isActive('/') ? 'text-white' : 'text-gray-400'
          )}
        >
          <MessageSquare size={20} />
          <span>Content</span>
        </Link>
        
        <Link 
          to="/brand-identity" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1",
            isActive('/brand-identity') ? 'text-white' : 'text-gray-400'
          )}
        >
          <Settings size={20} />
          <span>Brand</span>
        </Link>
        
        <Link 
          to="/virality" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1",
            isActive('/virality') ? 'text-white' : 'text-gray-400'
          )}
        >
          <TrendingUp size={20} />
          <span>Virality</span>
        </Link>
        
        <Link 
          to={user ? "/dashboard" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1",
            (isActive('/dashboard') || isActive('/login')) ? 'text-white' : 'text-gray-400'
          )}
        >
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default FooterMenu;
