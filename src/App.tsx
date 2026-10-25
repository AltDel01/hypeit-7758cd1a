import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CustomErrorBoundary from "./components/error/ErrorBoundary";
import AvaButton from "./components/audio/AvaButton";
import AdminRoute from "./components/routes/AdminRoute";
import EditorRoute from "./components/routes/EditorRoute";
import Index from "./pages/Index";
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const StableDiffusionPage = React.lazy(() => import("./pages/StableDiffusionPage"));
const Admin = React.lazy(() => import("./pages/Admin"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminRequestWorkspace = React.lazy(() => import("./pages/AdminRequestWorkspace"));
const EditorDashboard = React.lazy(() => import("./pages/EditorDashboard"));
const EditorRequestWorkspace = React.lazy(() => import("./pages/EditorRequestWorkspace"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const Settings = React.lazy(() => import("./pages/Settings"));
const CreditUsage = React.lazy(() => import("./pages/CreditUsage"));
const Language = React.lazy(() => import("./pages/Language"));
const Enterprise = React.lazy(() => import("./pages/Enterprise"));
const Features = React.lazy(() => import("./pages/Features"));
const RefundRequest = React.lazy(() => import("./pages/RefundRequest"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const InviteRedirect = React.lazy(() => import("./pages/InviteRedirect"));
const Explainer = React.lazy(() => import("./pages/Explainer"));
const Careers = React.lazy(() => import("./pages/Careers"));
const HeroPreview = React.lazy(() => import("./pages/HeroPreview"));
const CareerApply = React.lazy(() => import("./pages/CareerApply"));
const Tools = React.lazy(() => import("./pages/Tools"));
const PostingHistory = React.lazy(() => import("./pages/PostingHistory"));
const TrendResearch = React.lazy(() => import("./pages/TrendResearch"));
const OAuthConsent = React.lazy(() => import("./pages/OAuthConsent"));
const SocialOAuthCallback = React.lazy(() => import("./pages/SocialOAuthCallback"));
const VeoStudio = React.lazy(() => import("./pages/VeoStudio"));
import { useLanguage } from "./hooks/useLanguage";

// Create a new query client outside of component rendering
const queryClient = new QueryClient();

// Resolves the UI language (saved preference > device > country) app-wide
const LanguageBootstrap = () => {
  useLanguage();
  return null;
};


// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    // Save intended destination so user returns here after login
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('postLoginRedirect', currentUrl);
    sessionStorage.setItem('authRedirectPending', '1');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Auth routes - redirect to home if already logged in
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (user) {
    // If there's a pending redirect (e.g. from email deep-link), go there instead of home
    const pendingRedirect = sessionStorage.getItem('postLoginRedirect');
    if (pendingRedirect) {
      sessionStorage.removeItem('postLoginRedirect');
      sessionStorage.removeItem('authRedirectPending');
      return <Navigate to={pendingRedirect} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App routes with AuthProvider
const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
    <Routes>
      <Route path="/" element={<CustomErrorBoundary><Index /></CustomErrorBoundary>} />
      <Route path="/hero-preview" element={<CustomErrorBoundary><HeroPreview /></CustomErrorBoundary>} />
      <Route path="/pricing" element={<CustomErrorBoundary><Pricing /></CustomErrorBoundary>} />
      <Route path="/enterprise" element={<CustomErrorBoundary><Enterprise /></CustomErrorBoundary>} />
      <Route path="/features" element={<CustomErrorBoundary><Features /></CustomErrorBoundary>} />
      <Route path="/analytics" element={<CustomErrorBoundary><Analytics /></CustomErrorBoundary>} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><CustomErrorBoundary><Dashboard /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route
        path="/posts"
        element={<ProtectedRoute><CustomErrorBoundary><PostingHistory /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route
        path="/trends"
        element={<ProtectedRoute><CustomErrorBoundary><TrendResearch /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route path="/inpainting" element={<CustomErrorBoundary><StableDiffusionPage /></CustomErrorBoundary>} />
      <Route
        path="/settings"
        element={<ProtectedRoute><CustomErrorBoundary><Settings /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route
        path="/credit-usage"
        element={<ProtectedRoute><CustomErrorBoundary><CreditUsage /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route
        path="/language"
        element={<ProtectedRoute><CustomErrorBoundary><Language /></CustomErrorBoundary></ProtectedRoute>}
      />
      {/* Admin routes */}
      <Route
        path="/admin"
        element={<AdminRoute><CustomErrorBoundary><Admin /></CustomErrorBoundary></AdminRoute>}
      />
      <Route
        path="/admin/requests/:requestId"
        element={<AdminRoute><CustomErrorBoundary><AdminRequestWorkspace /></CustomErrorBoundary></AdminRoute>}
      />
      {/* Editor routes */}
      <Route
        path="/editor"
        element={<EditorRoute><CustomErrorBoundary><EditorDashboard /></CustomErrorBoundary></EditorRoute>}
      />
      <Route
        path="/editor/requests/:requestId"
        element={<EditorRoute><CustomErrorBoundary><EditorRequestWorkspace /></CustomErrorBoundary></EditorRoute>}
      />
      <Route
        path="/admin-login"
        element={<CustomErrorBoundary><AdminLogin /></CustomErrorBoundary>}
      />
      <Route
        path="/login"
        element={<AuthRoute><CustomErrorBoundary><Login /></CustomErrorBoundary></AuthRoute>}
      />
      <Route
        path="/signup"
        element={<AuthRoute><CustomErrorBoundary><Signup /></CustomErrorBoundary></AuthRoute>}
      />
      <Route path="/faq" element={<CustomErrorBoundary><FAQ /></CustomErrorBoundary>} />
      <Route path="/explainer" element={<CustomErrorBoundary><Explainer /></CustomErrorBoundary>} />
      <Route path="/careers" element={<CustomErrorBoundary><Careers /></CustomErrorBoundary>} />
      <Route path="/careers/apply" element={<CustomErrorBoundary><CareerApply /></CustomErrorBoundary>} />
      <Route path="/refund-request" element={<CustomErrorBoundary><RefundRequest /></CustomErrorBoundary>} />
      <Route path="/tools" element={<CustomErrorBoundary><Tools /></CustomErrorBoundary>} />
      <Route path="/invite/:code" element={<InviteRedirect />} />
      {/* Unlisted internal Veo workbench, not linked from any menu */}
      <Route
        path="/lab/veo-studio"
        element={<ProtectedRoute><CustomErrorBoundary><VeoStudio /></CustomErrorBoundary></ProtectedRoute>}
      />
      <Route path="/.lovable/oauth/consent" element={<CustomErrorBoundary><OAuthConsent /></CustomErrorBoundary>} />
      <Route path="/oauth/:provider/callback" element={<SocialOAuthCallback />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<CustomErrorBoundary><NotFound /></CustomErrorBoundary>} />
    </Routes>
    </Suspense>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <LanguageBootstrap />
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
