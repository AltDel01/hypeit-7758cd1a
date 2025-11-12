
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormHeaderProps {
  errorMessage?: string | null;
}

const FormHeader: React.FC<FormHeaderProps> = ({ errorMessage }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Stable Diffusion Inpainting</h2>
      <p className="text-gray-500 mb-4">
        Upload an image and draw a mask, then provide a prompt to inpaint the masked area.
      </p>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FormHeader;
