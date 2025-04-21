
import React, { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';

interface PromptContextType {
  globalPrompt: string;
  setGlobalPrompt: Dispatch<SetStateAction<string>>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalPrompt, setGlobalPrompt] = useState('');

  return (
    <PromptContext.Provider value={{ globalPrompt, setGlobalPrompt }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};
