import React, { useRef } from "react";
import Draggable from "react-draggable";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { Share2, Download, Info } from "lucide-react";
import { useApp } from "../stores/app-context";
import { defaultState, updateURLState } from "../stores/map-state";
import { copy } from "../utils/clipboard";
import { ToastCopied } from "../utils/toast";

interface ControlPanelProps {
  onExportPng: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onExportPng }) => {
  const {
    state,
    setState,
    setInfoMenu,
    setToast,
    updateToast,
    enableTouchControls,
    setEnableTouchControls,
  } = useApp();

  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
      <div
        ref={nodeRef}
        className="fixed top-0 left-0 bg-gray-600/80 px-5 py-3 m-1 rounded-xl shadow-lg border border-gray-400 backdrop-blur-sm z-50"
      >
        <div className="drag-handle cursor-move bg-gray-600/50 bg-gray-600 p-1 mb-2 rounded text-center text-[10px] uppercase tracking-widest font-bold text-white">
          :::
        </div>
        <p className="text-white">
          View: <b>{state.view.main}</b>
        </p>
        <MathJaxContext>
          <p className="text-white">
            Point:{" "}
            <MathJax
              inline
            >{`\\(${state.position.toArgand().re.toFixed(3)} ${state.position.toArgand().im >= 0 ? "+" : "-"} ${Math.abs(state.position.toArgand().im).toFixed(3)}i\\)`}</MathJax>
          </p>
        </MathJaxContext>
        <div className="flex flex-col my-1 text-white">
          <p>
            Max Iterations: <b>{state.iterations}</b>
          </p>
          <input
            type="range"
            min="100"
            max="20000"
            step="100"
            value={state.iterations}
            onChange={(e) =>
              setState({ ...state, iterations: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <p className="text-white">
          Zoom: <b>{state.zoom.toFixed(1)}</b>
        </p>
        <p className="text-white">
          Dynamic: <b>{state.dynamic.toString()}</b>
        </p>
        <div className="flex items-center justify-start gap-1 text-white">
          <button
            onClick={() =>
              setState({ ...state, experimental: !state.experimental })
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              state.experimental ? "!bg-blue-500" : "!bg-gray-700"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                state.experimental ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <p>
            <span className="relative top-[2.5px]">Experimental?</span>
          </p>
        </div>
        <div className="flex items-center justify-start gap-1 text-white">
          <button
            onClick={() => setEnableTouchControls(!enableTouchControls)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              enableTouchControls ? "!bg-blue-500" : "!bg-gray-700"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                enableTouchControls ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <p>
            <span className="relative top-[2.5px]">Touch controls?</span>
          </p>
        </div>
        <br />
        <p className="text-xs w-[200px] text-white">
          Hint: Left-click to toggle dynamic <br />
          rendering; right-click to toggle view.
        </p>
        <br />

        <div className="flex flex-row justify-around w-full text-white">
          <button
            className="bg-gray-700 hover:bg-gray-800 rounded text-sm px-3 py-1"
            onClick={() => {
              setState(defaultState);
              updateURLState(null);
              setToast((prev) =>
                prev ? { ...prev, display: false } : undefined,
              );
            }}
          >
            Reset
          </button>
          <button
            className="p-1.5 bg-gray-700 hover:bg-gray-800 rounded"
            onClick={() => {
              updateURLState(state);
              copy(window.location.href);
              updateToast(ToastCopied, 200, 10000);
            }}
          >
            <Share2 size={24} />
          </button>
          <button
            className="p-1.5 bg-gray-700 hover:bg-gray-800 rounded"
            onClick={onExportPng}
          >
            <Download size={24} />
          </button>
          <button
            className="p-1.5 bg-gray-700 hover:bg-gray-800 rounded"
            onClick={() => {
              setInfoMenu(true);
            }}
          >
            <Info size={24} />
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default ControlPanel;
