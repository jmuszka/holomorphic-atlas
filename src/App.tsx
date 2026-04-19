import { useRef, useEffect, useState, useLayoutEffect } from "react";
import Draggable from "react-draggable";
import {
  type MapState,
  defaultState,
  loadURLState,
  updateURLState,
} from "./stores/map-state";
import { render } from "./shaders/render";
import { Position } from "./utils/mouse";

const App = () => {
  const canvasRef = useRef(null);
  const miniCanvasRef = useRef(null);
  const nodeRef = useRef(null);

  const [state, setState] = useState<MapState>(loadURLState());

  // Init
  useLayoutEffect(() => {
    setState(loadURLState());
  }, []);

  // OpenGL rendering for each canvas
  useEffect(() => {
    render(canvasRef, state, true);
    render(miniCanvasRef, state, false);
  }, [state]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={state.fidelity * window.innerHeight}
        height={state.fidelity * window.innerWidth}
        className="w-screen h-screen"
        onClick={(e) => {
          // Toggle dynamic mode and update position
          setState({
            ...state,
            dynamic: !state.dynamic,
            position: new Position({ x: e.clientX, y: e.clientY }),
          });
        }}
        onContextMenu={(e) => {
          e.preventDefault();

          // Swap canvases
          setState({
            ...state,
            view: {
              main: state.view.mini,
              mini: state.view.main,
            },
          });
        }}
        onMouseMove={(e) => {
          // Update position
          if (state.dynamic)
            setState({
              ...state,
              position: new Position({ x: e.clientX, y: e.clientY }),
            });
        }}
      />

      <div className="fixed bottom-0 right-0 outline-solid m-3">
        <p className="absolute -top-6 w-full text-center">
          View: <b>{state.view.mini}</b>
        </p>
        <canvas
          ref={miniCanvasRef}
          width={window.innerWidth / 5.0}
          height={window.innerHeight / 5.0}
        />
      </div>

      <Draggable nodeRef={nodeRef} handle=".drag-handle">
        <div
          ref={nodeRef}
          className="fixed top-0 left-0 bg-gray-500/80 px-5 py-3 m-1 rounded-xl shadow-lg border border-gray-400"
        >
          <div className="drag-handle cursor-move bg-gray-600/50 bg-gray-600 p-1 mb-2 rounded text-center text-[10px] uppercase tracking-widest font-bold">
            :::
          </div>
          <p>
            View: <b>{state.view.main}</b>
          </p>
          <p>
            Fidelity: <b>{state.fidelity.toFixed(1)}</b>
          </p>
          <p>
            Point:{" "}
            <b>
              {state.position.toArgand().re.toFixed(3)}{" "}
              {state.position.toArgand().im >= 0 ? "+" : "-"}{" "}
              {Math.abs(state.position.toArgand().im).toFixed(3)}i
            </b>
          </p>
          <p>
            Dynamic: <b>{state.dynamic.toString()}</b>
          </p>
          <br />
          <p className="text-xs">
            Hint: Left-click to toggle dynamic <br />
            rendering; right-click to toggle view.
          </p>
          <br />

          <div className="flex flex-row justify-around w-full">
            <button
              className="bg-gray-700 hover:bg-gray-800 px-2 py-1 rounded text-sm"
              onClick={() => {
                setState(defaultState);
                updateURLState(null);
              }}
            >
              Reset
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm"
              onClick={() => {
                updateURLState(state);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Draggable>
    </>
  );
};

export default App;
