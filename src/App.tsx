import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CustomErrorBoundary from "./components/error/ErrorBoundary";
import AvaButton from "./components/audio/AvaButton";
import Index from "./pages/Index";
import BrandIdentity from "./pages/BrandIdentity";
import Virality from "./pages/Virality";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StableDiffusionPage from "./pages/StableDiffusionPage";
import Admin from "./pages/Admin";
import Pricing from "./pages/Pricing";
import React from "react";

// Create a new query client outside of component rendering
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

// Auth routes - redirect to home if already logged in
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (user) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

// App routes with AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomErrorBoundary><Index /></CustomErrorBoundary>} />
      <Route path="/pricing" element={<CustomErrorBoundary><Pricing /></CustomErrorBoundary>} />
      <Route path="/virality" element={<CustomErrorBoundary><Virality /></CustomErrorBoundary>} />
      <Route path="/brand-identity" element={<CustomErrorBoundary><BrandIdentity /></CustomErrorBoundary>} />
      <Route path="/analytics" element={<CustomErrorBoundary><Analytics /></CustomErrorBoundary>} />
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><CustomErrorBoundary><Dashboard /></CustomErrorBoundary></ProtectedRoute>} 
      />
      <Route path="/inpainting" element={<CustomErrorBoundary><StableDiffusionPage /></CustomErrorBoundary>} />
      <Route 
        path="/admin" 
        element={<ProtectedRoute><CustomErrorBoundary><Admin /></CustomErrorBoundary></ProtectedRoute>} 
      />
      <Route 
        path="/login" 
        element={<AuthRoute><CustomErrorBoundary><Login /></CustomErrorBoundary></AuthRoute>} 
      />
      <Route 
        path="/signup" 
        element={<AuthRoute><CustomErrorBoundary><Signup /></CustomErrorBoundary></AuthRoute>} 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<CustomErrorBoundary><NotFound /></CustomErrorBoundary>} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CustomErrorBoundary>
            <AppRoutes />
            <AvaButton />
            <Toaster />
            <Sonner />
          </CustomErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
