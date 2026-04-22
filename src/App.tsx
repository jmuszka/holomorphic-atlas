import { useRef, useEffect, useState, useLayoutEffect } from "react";
import Draggable from "react-draggable";
import {
  type MapState,
  defaultState,
  loadURLState,
  updateURLState,
} from "./stores/map-state";
import { render, initGL, type GLContext } from "./shaders/render";
import { Position } from "./utils/position";

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRef = useRef(null);

  const mainGLRef = useRef<GLContext | null>(null);
  const miniGLRef = useRef<GLContext | null>(null);

  const [state, setState] = useState<MapState>(loadURLState());
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const hasMovedRef = useRef(false);

  // Init
  useLayoutEffect(() => {
    setState(loadURLState());
  }, []);

  // OpenGL rendering for each canvas
  useEffect(() => {
    if (canvasRef.current && !mainGLRef.current) {
      mainGLRef.current = initGL(canvasRef.current);
    }
    if (miniCanvasRef.current && !miniGLRef.current) {
      miniGLRef.current = initGL(miniCanvasRef.current);
    }

    if (mainGLRef.current) render(mainGLRef.current, state, true);
    if (miniGLRef.current) render(miniGLRef.current, state, false);
  }, [state]);

  const updatePosition = async (pos: Position) => {
    setState({
      ...state,
      position: pos,
    });
  };

  const updateOffset = async (adjustment: Position) => {
    // TODO: constraints
    setState({
      ...state,
      offset: adjustment,
    });
  };

  /*
  const updateZoom = async (newZoom: number) => {
    // TODO: constraints
    setState({
      ...state,
      zoom: newZoom,
    });
  };
  */

  return (
    <>
      <canvas
        ref={canvasRef}
        width={state.fidelity * window.innerHeight}
        height={state.fidelity * window.innerWidth}
        className="w-screen h-screen"
        onMouseDown={() => {
          hasMovedRef.current = false;
        }}
        onClick={(e) => {
          // TODO: pointer position needs to offsetted
          if (hasMovedRef.current) return;

          // Toggle dynamic mode and update position
          setState({
            ...state,
            dynamic: !state.dynamic,
            position: new Position({ x: e.clientX, y: e.clientY }),
          });

          // updatePosition(new Position({ x: e.clientX, y: e.clientY }));
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
          // Dragging
          if (e.buttons !== 0) {
            hasMovedRef.current = true;

            // Update map offset with delta if user is dragging
            // setState({
            //  ...state,
            //  offset: new Position({
            //    x: state.offset.x + (e.clientX - mousePos.x) / state.zoom,
            //    y: state.offset.y + (e.clientY - mousePos.y) / state.zoom,
            //  }),
            // });

            // TODO: remove mousepos, should be able to just use state position
            updateOffset(
              new Position({
                x:
                  state.offset.getPosition().x +
                  (e.clientX - mousePos.x) / state.zoom,
                y:
                  state.offset.getPosition().y +
                  (e.clientY - mousePos.y) / state.zoom,
              }),
            );
          }
          // Not dragging
          else {
            // Update position (only if not dragging)
            // if (state.dynamic)
            //  setState({
            //    ...state,
            //    position: new Position({ x: e.clientX, y: e.clientY }),
            //  });

            if (state.dynamic)
              updatePosition(new Position({ x: e.clientX, y: e.clientY }));
          }

          // Update mouse tracker
          setMousePos({
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onWheel={(e) => {
          const zoomDelta = e.deltaY / window.innerHeight;
          const rate = 1.0;

          setState({
            ...state,
            zoom: state.zoom + zoomDelta * rate,
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
            Zoom: <b>{state.zoom.toFixed(1)}</b>
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
      <p className="fixed z-10 left-1 bottom-0">
        Offset: ({state.offset.toArgand().re.toFixed(3)},{" "}
        {state.offset.toArgand().im.toFixed(3)})
      </p>
    </>
  );
};

export default App;
