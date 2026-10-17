import React, { createContext, useContext, useState } from 'react';

interface AIContextType {
  isOmnibarOpen: boolean;
  openOmnibar: () => void;
  closeOmnibar: () => void;
  toggleOmnibar: () => void;
  currentPageContext: string;
  setCurrentPageContext: (ctx: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [currentPageContext, setCurrentPageContext] = useState('Command Center');

  const openOmnibar = () => setIsOmnibarOpen(true);
  const closeOmnibar = () => setIsOmnibarOpen(false);
  const toggleOmnibar = () => setIsOmnibarOpen((prev) => !prev);

  return (
    <AIContext.Provider
      value={{
        isOmnibarOpen,
        openOmnibar,
        closeOmnibar,
        toggleOmnibar,
        currentPageContext,
        setCurrentPageContext
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within an AIProvider');
  return context;
};
