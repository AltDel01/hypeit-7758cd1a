
import React from 'react';
import { TestRequestForm } from '@/components/admin/TestRequestForm';
import { useTestRequest } from '@/hooks/useTestRequest';
import { useRequestManagement } from '@/hooks/useRequestManagement';
import { useAuth } from '@/contexts/AuthContext';

export const TestRequestSection = () => {
  const { user } = useAuth();
  const { debugInfo, setDebugInfo } = useRequestManagement();
  const { testPrompt, setTestPrompt, handleCreateTestRequest, handleClearAllRequests } = useTestRequest({
    loadRequests: () => {}, // This will be handled by the event system
    setDebugInfo
  });

  return (
    <TestRequestForm 
      testPrompt={testPrompt}
      onTestPromptChange={setTestPrompt}
      onCreateTest={() => handleCreateTestRequest(user?.id || '', user?.email)}
      onClearAll={handleClearAllRequests}
      debugInfo={debugInfo}
    />
  );
};
