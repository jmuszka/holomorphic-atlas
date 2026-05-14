import { Plus, Minus } from "lucide-react";
import { useApp } from "../stores/app-context";

const ZoomControls = () => {
  const { state, setState } = useApp();

  return (
    <div className="flex flex-row gap-2 justify-center bg-gray-600/40 p-2 rounded-xl backdrop-blur-sm border border-gray-400/30">
      <button
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-full shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() => setState({ ...state, zoom: state.zoom / 1.5 })}
        title="Zoom Out"
      >
        <Minus size={24} />
      </button>
      <button
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-full shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() => setState({ ...state, zoom: state.zoom * 1.5 })}
        title="Zoom In"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default ZoomControls;
