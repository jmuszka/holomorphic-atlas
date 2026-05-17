import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import HoloAtlas from "./holo-atlas";
import Explanation from "./explanation";
import Implementation from "./implementation";
import { useApp } from "../stores/app-context";
import { InfoMenuContext } from "./info-menu-context";

const InfoMenu = () => {
  const { infoMenu, setInfoMenu } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const menus = [HoloAtlas, Explanation, Implementation];
  const CurrentMenu = menus[currentIndex];

  // Close info menu by pressing escape key
  useEffect(() => {
    if (!document.onkeydown) {
      document.onkeydown = (e) => {
        const evt = e || window.event;

        let isEscape = infoMenu;
        if ("key" in evt) isEscape = evt.key === "Escape" || evt.key === "Esc";

        if (isEscape) setInfoMenu(false);
      };
    }
  });

  if (!infoMenu) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % menus.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + menus.length) % menus.length);

  return (
    <>
      <div className="fixed z-[60] bg-gray-900/70 w-full h-full"></div>
      <div className="flex flex-col justify-center w-full h-full fixed z-[70] items-center">
        <div className="bg-gray-600/80 rounded-xl shadow-lg border border-gray-400 max-w-2xl w-full backdrop-blur-sm text-lg max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex flex-row justify-end px-8 pt-6">
            <button
              className="p-1.5 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors"
              onClick={() => setInfoMenu(false)}
            >
              <X size={18} color="white" />
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <InfoMenuContext.Provider value={{ currentIndex }}>
              <CurrentMenu />
            </InfoMenuContext.Provider>
          </div>

          <div className="flex flex-row justify-between items-center px-8 py-6 border-t border-gray-400/30">
            <button
              className="p-2 hover:bg-gray-600/50 rounded-full transition-colors"
              onClick={prev}
            >
              <ChevronLeft size={24} color="white" />
            </button>
            <span className="text-xs text-gray-400 font-mono">
              {currentIndex + 1} / {menus.length}
            </span>
            <button
              className="p-2 hover:bg-gray-600/50 rounded-full transition-colors"
              onClick={next}
            >
              <ChevronRight size={24} color="white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoMenu;
