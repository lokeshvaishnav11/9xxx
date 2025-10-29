// isOpenContext.js
import React, { createContext, useContext, useState } from 'react';

// Create a Context
const IsOpenContext = createContext();

// Provider component to wrap around your app and provide the isOpen state
export const IsOpenProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // Default isOpen value

  const toggleIsOpen = () => setIsOpen(prev => !prev); // Toggle function

  return (
    <IsOpenContext.Provider value={{ isOpen, toggleIsOpen }}>
      {children}
    </IsOpenContext.Provider>
  );
};

// Custom hook to use the isOpen context
export const useIsOpen = () => useContext(IsOpenContext);
