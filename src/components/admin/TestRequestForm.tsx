
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface TestRequestFormProps {
  testPrompt: string;
  onTestPromptChange: (value: string) => void;
  onCreateTest: () => void;
  onClearAll: () => void;
  debugInfo: string;
}

export const TestRequestForm = ({
  testPrompt,
  onTestPromptChange,
  onCreateTest,
  onClearAll,
  debugInfo
}: TestRequestFormProps) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold mb-4 text-white">Create Test Request</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="col-span-2">
          <Label htmlFor="test-prompt">Test Prompt</Label>
          <Input 
            id="test-prompt"
            value={testPrompt}
            onChange={(e) => onTestPromptChange(e.target.value)}
            placeholder="Enter a test prompt"
            className="bg-gray-800/50 border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onCreateTest} 
            className="flex items-center gap-2"
            variant="newPurple"
          >
            <Plus className="h-4 w-4" />
            Create Test Request
          </Button>
          <Button 
            onClick={onClearAll} 
            variant="destructive"
          >
            Clear All
          </Button>
        </div>
      </div>
      {debugInfo && (
        <div className="mt-3 p-2 bg-gray-800/50 rounded text-sm text-gray-400 font-mono">
          <p>Debug: {debugInfo}</p>
        </div>
      )}
    </div>
  );
};
