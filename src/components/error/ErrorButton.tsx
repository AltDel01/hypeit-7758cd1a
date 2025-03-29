
import React from 'react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/react';

const ErrorButton = () => {
  const throwError = () => {
    try {
      throw new Error("This is your first Sentry error!");
    } catch (error) {
      Sentry.captureException(error);
      throw error; // Re-throw to trigger the error boundary
    }
  };

  return (
    <Button 
      variant="destructive"
      onClick={throwError}
      className="my-4"
    >
      Break the world
    </Button>
  );
};

export default ErrorButton;
