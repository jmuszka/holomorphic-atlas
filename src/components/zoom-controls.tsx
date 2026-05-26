import { Plus, Minus } from "lucide-react";
import { useApp } from "../stores/app-context";
import { Point } from "../utils/position";

const ZoomControls = () => {
  const { state, setState } = useApp();
  const ZOOM_FACTOR = 1.5;

  return (
    <div className="flex flex-row gap-2 justify-center bg-slate-900/80 p-2 rounded-xl backdrop-blur-sm border border-gray-400/30">
      <button
        role="button"
        className="p-2 rounded-full shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          setState({
            ...state,
            zoom: state.zoom / ZOOM_FACTOR,
            canvasOffset: new Point({
              x:
                window.innerWidth / 2 -
                (window.innerWidth / 2 - state.canvasOffset.raw().x) /
                  ZOOM_FACTOR,
              y:
                window.innerHeight / 2 -
                (window.innerHeight / 2 - state.canvasOffset.raw().y) /
                  ZOOM_FACTOR,
            }),
            mousePosition: new Point({
              x:
                window.innerWidth / 2 +
                (state.mousePosition.raw().x - window.innerWidth / 2) /
                  ZOOM_FACTOR,
              y:
                window.innerHeight / 2 +
                (state.canvasOffset.raw().y - window.innerHeight / 2) /
                  ZOOM_FACTOR,
            }),
          })
        }
        title="Zoom Out"
      >
        <Minus size={24} />
      </button>
      <button
        role="button"
        className="p-2 bg-gray-600/80 hover:bg-gray-700/80 rounded-full shadow-lg border border-gray-400 backdrop-blur-sm text-white transition-colors"
        onClick={() =>
          setState({
            ...state,
            zoom: state.zoom * ZOOM_FACTOR,
            canvasOffset: new Point({
              x:
                window.innerWidth / 2 -
                (window.innerWidth / 2 - state.canvasOffset.raw().x) *
                  ZOOM_FACTOR,
              y:
                window.innerHeight / 2 -
                (window.innerHeight / 2 - state.canvasOffset.raw().y) *
                  ZOOM_FACTOR,
            }),
            mousePosition: new Point({
              x:
                window.innerWidth / 2 +
                (state.mousePosition.raw().x - window.innerWidth / 2) *
                  ZOOM_FACTOR,
              y:
                window.innerHeight / 2 +
                (state.canvasOffset.raw().y - window.innerHeight / 2) *
                  ZOOM_FACTOR,
            }),
          })
        }
        title="Zoom In"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default ZoomControls;
