import { createContext, useContext } from "react";
import { type MapState } from "./map-state";
import { type IToast } from "../utils/toast";

export interface AppContextType {
  state: MapState;
  setState: React.Dispatch<React.SetStateAction<MapState>>;
  infoMenu: boolean;
  setInfoMenu: React.Dispatch<React.SetStateAction<boolean>>;
  toast: IToast | undefined;
  setToast: React.Dispatch<React.SetStateAction<IToast | undefined>>;
  enableTouchControls: boolean;
  setEnableTouchControls: React.Dispatch<React.SetStateAction<boolean>>;
  updateToast: (
    newToast: IToast,
    delay: number,
    duration: number,
  ) => () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
