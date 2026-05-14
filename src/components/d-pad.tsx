import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../stores/app-context";
import { Position } from "../utils/position";

const DPad = () => {
  const { state, setState } = useApp();

  const updateOffset = (adjustment: Position) => {
    setState({
      ...state,
      offset: adjustment,
    });
  };

  return (
    <div className="grid grid-cols-3 gap-1 bg-gray-600/40 p-2 rounded-xl backdrop-blur-sm border border-gray-400/30">
      <div />
      <button
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          updateOffset(
            new Position({
              x: state.offset.getPosition().x,
              y: state.offset.getPosition().y + 50 / state.zoom,
            }),
          )
        }
        title="Pan Up"
      >
        <ChevronUp size={24} />
      </button>
      <div />

      <button
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          updateOffset(
            new Position({
              x: state.offset.getPosition().x + 50 / state.zoom,
              y: state.offset.getPosition().y,
            }),
          )
        }
        title="Pan Left"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="flex items-center justify-center text-[10px] text-gray-300 font-bold">
        PAN
      </div>
      <button
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          updateOffset(
            new Position({
              x: state.offset.getPosition().x - 50 / state.zoom,
              y: state.offset.getPosition().y,
            }),
          )
        }
        title="Pan Right"
      >
        <ChevronRight size={24} />
      </button>

      <div />
      <button
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-lg shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          updateOffset(
            new Position({
              x: state.offset.getPosition().x,
              y: state.offset.getPosition().y - 50 / state.zoom,
            }),
          )
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
