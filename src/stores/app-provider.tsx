import React, { useState, useEffect } from "react";
import { loadURLState } from "./map-state";
import { type IToast, ToastTip } from "../utils/toast";
import { isMobile } from "../utils/is-mobile";
import { AppContext, type AppContextType } from "./app-context";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState(loadURLState());
  const [infoMenu, setInfoMenu] = useState<boolean>(false);
  const [toast, setToast] = useState<IToast | undefined>();
  const [enableTouchControls, setEnableTouchControls] =
    useState<boolean>(isMobile);

  const updateToast = (newToast: IToast, delay: number, duration: number) => {
    const showTimer = setTimeout(() => setToast(newToast), delay);
    const hideTimer = setTimeout(
      () =>
        setToast((prev) => (prev ? { ...prev, display: false } : undefined)),
      duration,
    );
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  };

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      localStorage.setItem("hasVisited", "true");
      updateToast(ToastTip, 2000, 10000);
    }
  }, []);

  const value: AppContextType = {
    state,
    setState,
    infoMenu,
    setInfoMenu,
    toast,
    setToast,
    enableTouchControls,
    setEnableTouchControls,
    updateToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
