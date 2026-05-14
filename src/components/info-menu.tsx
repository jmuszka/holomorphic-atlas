import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Controls from "./controls";
import Explanation from "./explanation";
import { useApp } from "../stores/app-context";

const InfoMenu = () => {
  const { infoMenu, setInfoMenu } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const menus = [Controls, Explanation];
  const CurrentMenu = menus[currentIndex];

  if (!infoMenu) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % menus.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + menus.length) % menus.length);

  return (
    <>
      <div className="fixed z-[60] bg-gray-900/70 w-full h-full"></div>
      <div className="flex flex-col justify-center w-full h-full fixed z-[70] flex flex-col items-center justify-center">
        <div className="bg-gray-600/80 px-8 py-6 rounded-xl shadow-lg border border-gray-400 max-w-2xl w-full backdrop-blur-sm space-y-6 text-lg max-h-[90vh] overflow-auto scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:rounded-full scrollbar-gutter-stable">
          <div className="flex flex-row justify-end">
            <button
              className="p-1.5 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors"
              onClick={() => setInfoMenu(false)}
            >
              <X size={18} color="white" />
            </button>
          </div>

          <div className="min-h-[300px]">
            <CurrentMenu />
          </div>

          <div className="flex flex-row justify-between items-center pt-4 border-t border-gray-400/30">
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
