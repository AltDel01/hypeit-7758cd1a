import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEditorRole } from '@/hooks/useEditorRole';

interface EditorRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route for editor role users
 */
const EditorRoute: React.FC<EditorRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isEditor, isLoading: roleLoading } = useEditorRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const redirectPath = `${location.pathname}${location.search}`;
    return <Navigate to={`/admin-login?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  if (!isEditor) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default EditorRoute;
