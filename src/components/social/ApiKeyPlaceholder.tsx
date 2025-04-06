
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface ApiKeyPlaceholderProps {
  service?: string;
}

const ApiKeyPlaceholder: React.FC<ApiKeyPlaceholderProps> = ({ service = "API" }) => {
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This feature requires an {service} key that was previously configured.
        </AlertDescription>
      </Alert>
      
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">
          {service} Configuration Required
        </h3>
        <p className="text-sm text-gray-400">
          The {service.toLowerCase()} key integration has been removed from this project.
          To use this feature, please contact the application administrator.
        </p>
        <Button className="mt-2" variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyPlaceholder;
