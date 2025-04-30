
import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import HomePageContent from '@/components/home/HomePageContent';
import { useAuth } from '@/contexts/AuthContext';
import { imageRequestService } from '@/services/requests';

const Index = () => {
  const { user } = useAuth();
  
  // Set up Sentry monitoring for this page
  useEffect(() => {
    Sentry.setUser({
      id: "example-user-id",
      email: "example@user.com",
      username: "exampleUser"
    });
    
    Sentry.setTag("page", "index");
    Sentry.setTag("feature", "image-generation");
  }, []);

  // Load latest user request
  useEffect(() => {
    if (user) {
      const latestRequest = imageRequestService.getLatestRequestForUser(user.id);
      if (latestRequest && latestRequest.status === 'completed' && latestRequest.resultImage) {
        const event = new CustomEvent('imageGenerated', { 
          detail: { imageUrl: latestRequest.resultImage } 
        });
        window.dispatchEvent(event);
      }
    }
  }, [user]);
  
  return <HomePageContent />;
};

export default Index;
