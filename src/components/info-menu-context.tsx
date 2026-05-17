import { createContext, useContext } from "react";

interface InfoMenuContextType {
  currentIndex: number;
}

export const InfoMenuContext = createContext<InfoMenuContextType | null>(null);

export const useInfoMenu = () => {
  const context = useContext(InfoMenuContext);
  if (!context) {
    throw new Error("useInfoMenu must be used within an InfoMenuProvider");
  }
  return context;
};
