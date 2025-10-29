import React, { createContext, useContext, useState } from "react";

const DrawerContext = createContext<any>("false");
interface DrawerProviderProps {
  children: any;
}

export const DrawerProvider: React.FC<DrawerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("");

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setIsOpen2(!isOpen2);
    console.log("Toggle Drawer");
  };

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        isOpen2,
        toggleDrawer,
        setIsOpen,
        setIsOpen2,
        activeMenu,
        setActiveMenu,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => useContext(DrawerContext);

// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   Dispatch,
//   SetStateAction,
// } from 'react';

// // Define the shape of your context
// interface DrawerContextType {
//   isOpen: boolean;
//   isOpen2: boolean;
//   toggleDrawer: () => void;
//   setIsOpen: Dispatch<SetStateAction<boolean>>;
//   setIsOpen2: Dispatch<SetStateAction<boolean>>;
// }

// // Create the context with an initial undefined value
// const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

// // Props type for provider
// interface DrawerProviderProps {
//   children: ReactNode;
// }

// export const DrawerProvider: React.FC<DrawerProviderProps> = ({ children }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isOpen2, setIsOpen2] = useState(false);

//   const toggleDrawer = () => {
//     setIsOpen((prev) => !prev);
//     setIsOpen2((prev) => !prev);
//     console.log("Toggle Drawer");
//   };

//   return (
//     <DrawerContext.Provider value={{ isOpen, isOpen2, toggleDrawer, setIsOpen, setIsOpen2 }}>
//       {children}
//     </DrawerContext.Provider>
//   );
// };

// export const useDrawer = (): DrawerContextType => {
//   const context = useContext(DrawerContext);
//   if (!context) {
//     throw new Error("useDrawer must be used within a DrawerProvider");
//   }
//   return context;
// };
