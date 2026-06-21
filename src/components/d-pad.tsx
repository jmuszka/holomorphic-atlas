import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../stores/app-context";
import { Point } from "../utils/position";

const DPad = () => {
  const { state, setState } = useApp();
  const DELTA = 50;

  return (
    <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-2 rounded-xl backdrop-blur-sm border border-gray-400/30">
      <div />
      <button
        role="button"
        className="p-2 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          setState({
            ...state,
            canvasOffset: new Point({
              x: state.canvasOffset.raw().x,
              y: state.canvasOffset.raw().y + DELTA,
            }),
            mousePosition: new Point({
              x: state.mousePosition.raw().x,
              y: state.mousePosition.raw().y + DELTA,
            }),
          })
        }
        title="Pan Up"
      >
        <ChevronUp size={24} />
      </button>
      <div />

      <button
        role="button"
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          setState({
            ...state,
            canvasOffset: new Point({
              x: state.canvasOffset.raw().x + DELTA,
              y: state.canvasOffset.raw().y,
            }),
            mousePosition: new Point({
              x: state.mousePosition.raw().x + DELTA,
              y: state.mousePosition.raw().y,
            }),
          })
        }
        title="Pan Left"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="flex items-center justify-center text-[10px] text-gray-300 font-bold select-none">
        PAN
      </div>
      <button
        role="button"
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          setState({
            ...state,
            canvasOffset: new Point({
              x: state.canvasOffset.raw().x - DELTA,
              y: state.canvasOffset.raw().y,
            }),
            mousePosition: new Point({
              x: state.mousePosition.raw().x - DELTA,
              y: state.mousePosition.raw().y,
            }),
          })
        }
        title="Pan Right"
      >
        <ChevronRight size={24} />
      </button>

      <div />
      <button
        role="button"
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          setState({
            ...state,
            canvasOffset: new Point({
              x: state.canvasOffset.raw().x,
              y: state.canvasOffset.raw().y - DELTA,
            }),
            mousePosition: new Point({
              x: state.mousePosition.raw().x,
              y: state.mousePosition.raw().y - DELTA,
            }),
          })
        }
        title="Pan Down"
      >
        <ChevronDown size={24} />
      </button>
      <div />
    </div>
  );
};

export default DPad;
