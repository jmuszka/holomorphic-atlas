import React from "react";
import { X } from "lucide-react";
import { type IToast } from "../utils/toast.tsx";
import { isMobile } from "../utils/is-mobile";

const Toast = ({
  toast,
  setToast,
}: {
  toast: IToast;
  setToast: React.Dispatch<React.SetStateAction<IToast | undefined>>;
}) => {
  return (
    <div className="fixed z-30">
      <div
        className={`top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 flex ${isMobile ? "justify-center" : "justify-end px-2"} w-[100vw] py-2`}
      >
        <div className="bg-gray-600/80 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-lg border border-gray-400 flex items-start gap-4 max-w-sm">
          <div className="bg-gray-600/50 p-2 rounded-lg mt-1">{toast.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{toast.title}</h3>
            <p className="text-sm text-gray-100 leading-snug mt-1">
              {toast.body}
            </p>
          </div>
          <button
            onClick={() => setToast({ ...toast, display: false })}
            className="hover:bg-gray-600/50 p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
