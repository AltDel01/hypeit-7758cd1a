
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CustomErrorBoundary from "./components/error/ErrorBoundary";
import Index from "./pages/Index";
import BrandIdentity from "./pages/BrandIdentity";
import Virality from "./pages/Virality";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StableDiffusionPage from "./pages/StableDiffusionPage";

// Import UI components for popup results
import { Button } from '@/components/ui/button';
import { Copy, Download, X } from 'lucide-react';
import { toast } from "sonner";

const queryClient = new QueryClient();

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// AuthRoute component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// AppRoutes component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomErrorBoundary><Index /></CustomErrorBoundary>} />
      <Route path="/brand-identity" element={<CustomErrorBoundary><BrandIdentity /></CustomErrorBoundary>} />
      <Route path="/virality" element={<CustomErrorBoundary><Virality /></CustomErrorBoundary>} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><CustomErrorBoundary><Dashboard /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route path="/inpainting" element={<CustomErrorBoundary><StableDiffusionPage /></CustomErrorBoundary>} />
      <Route
        path="/login"
        element={<AuthRoute><CustomErrorBoundary><Login /></CustomErrorBoundary></AuthRoute>}
      />
      <Route
        path="/signup"
        element={<AuthRoute><CustomErrorBoundary><Signup /></CustomErrorBoundary></AuthRoute>}
      />
      <Route path="*" element={<CustomErrorBoundary><NotFound /></CustomErrorBoundary>} />
    </Routes>
  );
};

// Main App component
const App = () => {
  // State for image results from event
  const [displayedImageUrl, setDisplayedImageUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false); // Control popup visibility
  const IMAGE_EVENT_NAME = 'imageGenerated'; // Event name

  // Effect to listen for global event
  useEffect(() => {
    const handleImageGenerated = (event: Event) => {
      // Fix: Cast event to CustomEvent with the correct type
      const customEvent = event as CustomEvent<{ imageUrl: string; prompt?: string }>;
      
      console.log("<<< App.tsx listener caught event >>>", customEvent.detail);

      if (customEvent.detail && typeof customEvent.detail.imageUrl === 'string') {
        setDisplayedImageUrl(customEvent.detail.imageUrl);
        setIsVisible(true); // Show popup when valid image received
      } else {
        console.warn("<<< App.tsx listener: Invalid event detail received >>>", customEvent.detail);
      }
    };

    // Add listener when App mounts
    window.addEventListener(IMAGE_EVENT_NAME, handleImageGenerated as EventListener);
    console.log("<<< App.tsx: Event listener for", IMAGE_EVENT_NAME, "added >>>");

    // Cleanup listener when App unmounts
    return () => {
      window.removeEventListener(IMAGE_EVENT_NAME, handleImageGenerated as EventListener);
      console.log("<<< App.tsx: Event listener for", IMAGE_EVENT_NAME, "removed >>>");
    };
  }, []); // Empty dependency array, run once

  // Handlers for UI Popup
  const handleClosePopup = () => {
    setIsVisible(false);
  };
  
  const handleDownloadPopup = () => {
    if (!displayedImageUrl) return;
    const a = document.createElement('a');
    a.href = displayedImageUrl;
    a.download = `generated-image.png`; // Name could be more dynamic
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image downloaded");
  };
  
  const handleCopyPopup = () => {
    if (!displayedImageUrl) return;
    navigator.clipboard.writeText(displayedImageUrl)
      .then(() => toast.success("Image URL copied"))
      .catch(err => {
        console.error("Copy failed:", err);
        toast.error("Failed to copy URL");
      });
  };

  // Main JSX Application
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Toasters outside BrowserRouter so they can be accessed from anywhere */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CustomErrorBoundary>
              {/* AppRoutes renders pages based on path */}
              <AppRoutes />

              {/* Result Popup Area */}
              {isVisible && displayedImageUrl && (
                <div
                  className="fixed bottom-4 right-4 z-[99] bg-white p-4 rounded-lg shadow-xl border border-gray-300 max-w-xs w-full animate-slide-in-bottom"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="popup-title"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 id="popup-title" className="text-sm font-semibold text-gray-800">Generated Image</h4>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-500 hover:bg-gray-100 rounded-full" 
                      onClick={handleClosePopup} 
                      aria-label="Close image preview"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  {/* Image */}
                  <div className="aspect-square overflow-hidden rounded-md mb-3 bg-gray-100 flex items-center justify-center">
                    <img
                      src={displayedImageUrl}
                      alt="Generated result"
                      className="max-w-full max-h-full object-contain"
                      onLoad={() => console.log("App.tsx Popup: Image loaded.")}
                      onError={() => console.error("App.tsx Popup: Image failed to load.")}
                    />
                  </div>
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleCopyPopup}>
                      <Copy size={12} className="mr-1"/> Copy URL
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleDownloadPopup}>
                      <Download size={12} className="mr-1"/> Download
                    </Button>
                  </div>
                </div>
              )}
              {/* Animation styles */}
              <style>
                {`
                  @keyframes slide-in-bottom {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                  .animate-slide-in-bottom {
                    animation: slide-in-bottom 0.3s ease-out forwards;
                  }
                `}
              </style>
            </CustomErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
