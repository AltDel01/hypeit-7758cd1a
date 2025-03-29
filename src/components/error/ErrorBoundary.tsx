
import React from 'react';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultErrorFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-6 border border-red-200 rounded-md bg-red-50">
    <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
    <p className="text-red-600 mb-4">We're sorry, but an error occurred while rendering this component.</p>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      Reload page
    </button>
  </div>
);

const CustomErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => {
  // Convert fallback to a proper React element
  const fallbackElement = fallback || <DefaultErrorFallback />;
  
  return ( 
    <Sentry.ErrorBoundary fallback={typeof fallbackElement === 'function' 
      ? fallbackElement 
      : () => <>{fallbackElement}</>
    }>
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default CustomErrorBoundary;
