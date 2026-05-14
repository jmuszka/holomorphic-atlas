import { useRef, useEffect, useState } from "react";
import Draggable from "react-draggable";
import {
  type MapState,
  defaultState,
  loadURLState,
  updateURLState,
} from "./stores/map-state";
import Toast from "./components/toast";
import { type IToast, ToastTip, ToastCopied } from "./utils/toast.tsx";
import { render, initGL, type GLContext } from "./shaders/render";
import { Position } from "./utils/position";
import { copy } from "./utils/clipboard";
import { Download, Share2, Info } from "lucide-react";
import InfoMenu from "./components/info-menu";
import { MathJax, MathJaxContext } from "better-react-mathjax";

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

  const [infoMenu, setInfoMenu] = useState<boolean>(false);
  const [toast, setToast] = useState<IToast | undefined>();

  const updateToast = (newToast: IToast, delay: number, duration: number) => {
    // Delay for 2 seconds before showing
    const showTimer = setTimeout(() => setToast(newToast), delay);
    // Auto-hide toast after 10 seconds (2s delay + 8s visible)
    const hideTimer = setTimeout(
      () =>
        setToast((prev) => (prev ? { ...prev, display: false } : undefined)),
      duration,
    );
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  };

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      localStorage.setItem("hasVisited", "true");
      updateToast(ToastTip, 2000, 10000);
    }
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

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !mainGLRef.current) return;

    // Ensure the latest frame is rendered
    render(mainGLRef.current, state, true);

    const link = document.createElement("a");
    link.download = `${state.view.main} Set (${new Date().toISOString()}).png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      {toast?.display && <Toast toast={toast} setToast={setToast} />}
      {infoMenu && <InfoMenu setInfoMenu={setInfoMenu} />}
      <div id="#stats-container" className="fixed top right"></div>

      {/* Main canvas */}
      <canvas
        id="main-canvas"
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
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
          const rate = state.zoom;

          setState({
            ...state,
            zoom: state.zoom - zoomDelta * rate,
          });
        }}
      />

      {/* Minimap canvas */}
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

      {/* Control panel*/}
      <Draggable nodeRef={nodeRef} handle=".drag-handle">
        <div
          ref={nodeRef}
          className="fixed top-0 left-0 bg-gray-600/80 px-5 py-3 m-1 rounded-xl shadow-lg border border-gray-400 backdrop-blur-sm"
        >
          <div className="drag-handle cursor-move bg-gray-600/50 bg-gray-600 p-1 mb-2 rounded text-center text-[10px] uppercase tracking-widest font-bold">
            :::
          </div>
          <p>
            View: <b>{state.view.main}</b>
          </p>
          <MathJaxContext>
            <p>
              Point:{" "}
              <MathJax
                inline
              >{`\\(${state.position.toArgand().re.toFixed(3)} ${state.position.toArgand().im >= 0 ? "+" : "-"} ${Math.abs(state.position.toArgand().im).toFixed(3)}i\\)`}</MathJax>
            </p>
          </MathJaxContext>
          <div className="flex flex-col my-1">
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
              className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <p>
            Zoom: <b>{state.zoom.toFixed(1)}</b>
          </p>
          <p>
            Dynamic: <b>{state.dynamic.toString()}</b>
          </p>
          <div className="flex items-center justify-start gap-1">
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
          <br />
          <p className="text-xs w-[200px]">
            Hint: Left-click to toggle dynamic <br />
            rendering; right-click to toggle view.
          </p>
          <br />

          <div className="flex flex-row justify-around w-full">
            <button
              className="bg-gray-700 hover:bg-gray-800 rounded text-sm px-3 py-1"
              onClick={() => {
                setState(defaultState);
                updateURLState(null);
                setToast((prev) =>
                  prev ? { ...prev, display: false } : undefined,
                ); // clear toast
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
              onClick={exportPng}
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
      <MathJaxContext>
        <p className="fixed z-10 left-1 bottom-0">
          Offset:{" "}
          <MathJax
            inline
          >{`\\(${state.offset.toArgand().re.toFixed(3)} ${state.offset.toArgand().im >= 0 ? "+" : "-"} ${Math.abs(state.offset.toArgand().im).toFixed(3)}i\\)`}</MathJax>
        </p>
      </MathJaxContext>
    </>
  );
};

export default App;
