// TODO: thorough comments all throughout codebase
import { useRef, useEffect, useState } from "react";
import Toast from "./components/toast";
import { render, initGL, type GLContext } from "./shaders/render";
import { Position } from "./utils/position";
import InfoMenu from "./components/info-menu";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { isMobile } from "./utils/is-mobile";
import { useApp } from "./stores/app-context";
import ControlPanel from "./components/control-panel";
import DPad from "./components/d-pad";
import ZoomControls from "./components/zoom-controls";

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);

  const mainGLRef = useRef<GLContext | null>(null);
  const miniGLRef = useRef<GLContext | null>(null);

  const { state, setState, enableTouchControls } = useApp();

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const hasMovedRef = useRef(false);

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

  // TODO: remove
  const updatePosition = async (pos: Position) => {
    setState({
      ...state,
      position: pos,
    });
  };

  // TODO: remove
  const updateOffset = async (adjustment: Position) => {
    // TODO: constraints
    setState({
      ...state,
      offset: adjustment,
    });
  };

  // TODO: move to utils
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
      <Toast />
      <InfoMenu />
      {!isMobile && (
        <div id="#stats-container" className="fixed top right"></div>
      )}

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
      <ControlPanel onExportPng={exportPng} />

      {/* Touch controls */}
      {enableTouchControls && (
        <div className="fixed bottom-12 left-4 flex flex-col gap-4 z-10">
          <DPad />
          <ZoomControls />
        </div>
      )}

      {/* Offset label */}
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
