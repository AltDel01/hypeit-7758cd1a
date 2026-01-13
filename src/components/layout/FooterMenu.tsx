
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Star, TrendingUp, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const FooterMenu = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  // Hide footer menu on homepage and landing pages
  const hiddenRoutes = ['/', '/pricing', '/login', '/signup'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#7a45e6] border-t border-purple-700 md:hidden">
      <nav className="flex justify-around items-center h-16 gap-2 px-1">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
          )}
        >
          <Camera size={24} />
          <span className="text-xs">Content</span>
        </Link>
        
        <Link 
          to="/virality" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/virality') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
          )}
        >
          <TrendingUp size={24} />
          <span className="text-xs">Virality</span>
        </Link>
        
        <Link 
          to="/brand-identity" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/brand-identity') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
          )}
        >
          <Star size={24} />
          <span className="text-xs">Brand Identity</span>
        </Link>
        
        <Link 
          to="/analytics" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/analytics') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
          )}
        >
          <BarChart2 size={24} />
          <span className="text-xs">Influencers</span>
        </Link>
      </nav>
    </div>
  );
};

export default FooterMenu;
