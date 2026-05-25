import { useRef, useEffect, useState, useMemo } from "react";
import Toast from "./components/toast";
import { render, initGL, type GLContext } from "./shaders/render";
import { Point, toComplex } from "./utils/position";
import InfoMenu from "./components/info-menu";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { isMobile } from "./utils/is-mobile";
import { useApp } from "./stores/app-context";
import ControlPanel from "./components/control-panel";
import DPad from "./components/d-pad";
import ZoomControls from "./components/zoom-controls";
import { Set } from "./types/set";

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);

  const mainGLRef = useRef<GLContext | null>(null);
  const miniGLRef = useRef<GLContext | null>(null);

  const { state, setState, enableTouchControls, infoMenu } = useApp();
  const offsetLabel = useMemo(() => {
    return `\\(${toComplex(state.canvasOffset, new Point({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), state.zoom).re.toFixed(3)} ${toComplex(state.canvasOffset, new Point({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), state.zoom).im >= 0 ? "+" : "-"} ${Math.abs(toComplex(state.canvasOffset, new Point({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), state.zoom).im).toFixed(3)}i\\)`;
  }, [state]);
  const offsetRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).MathJax && offsetRef.current) {
      // 1. Clear just this specific element's cache
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).MathJax.typesetClear([offsetRef.current]);

      // 2. Actually trigger the re-render for just this element
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).MathJax.typesetPromise([offsetRef.current]);
    }
  }, [offsetLabel]);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const hasMovedRef = useRef(false);

  const prevSizeRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const prevWidth = prevSizeRef.current.width;
      const prevHeight = prevSizeRef.current.height;

      setState((s) => {
        const scale = newHeight / prevHeight;
        const widthDiff = (newWidth - prevWidth * scale) / 2;

        return {
          ...s,
          mousePosition: new Point({
            x: s.mousePosition.raw().x * scale + widthDiff,
            y: s.mousePosition.raw().y * scale,
          }),
          canvasOffset: new Point({
            x: s.canvasOffset.raw().x * scale + widthDiff,
            y: s.canvasOffset.raw().y * scale,
          }),
        };
      });

      setMousePos({
        x: newWidth / 2,
        y: newHeight / 2,
      });

      prevSizeRef.current = { width: newWidth, height: newHeight };
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setState]);

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

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !mainGLRef.current) return;

    // Ensure the latest frame is rendered
    render(mainGLRef.current, state, true);

    const link = document.createElement("a");
    link.download = `${Set[state.view.main]} Set (${new Date().toISOString()}).png`;
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
          if (hasMovedRef.current) return;

          // Toggle dynamic mode and update position
          setState({
            ...state,
            dynamic: !state.dynamic,
            mousePosition: new Point({
              x: e.clientX,
              y: e.clientY,
            }),
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

            setState({
              ...state,
              mousePosition: new Point({
                x: state.mousePosition.raw().x + (e.clientX - mousePos.x),
                y: state.mousePosition.raw().y + (e.clientY - mousePos.y),
              }),
              canvasOffset: new Point({
                x: state.canvasOffset.raw().x + (e.clientX - mousePos.x),
                y: state.canvasOffset.raw().y + (e.clientY - mousePos.y),
              }),
            });
          }
          // Not dragging
          else {
            if (state.dynamic)
              setState({
                ...state,
                mousePosition: new Point({
                  x: e.clientX,
                  y: e.clientY,
                }),
              });
          }

          // Update mouse tracker
          setMousePos({
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onWheel={(e) => {
          setState((s) => {
            const zoomDelta = e.deltaY / window.innerHeight;
            const rate = s.zoom;
            const newZoom = s.zoom - zoomDelta * rate;

            const zoomRatio = newZoom / s.zoom;

            const off_x =
              e.clientX - (e.clientX - s.canvasOffset.raw().x) * zoomRatio;
            const off_y =
              e.clientY - (e.clientY - s.canvasOffset.raw().y) * zoomRatio;

            const mouseX =
              e.clientX + (s.mousePosition.raw().x - e.clientX) * zoomRatio;
            const mouseY =
              e.clientY + (s.mousePosition.raw().y - e.clientY) * zoomRatio;

            return {
              ...s,
              zoom: newZoom,
              canvasOffset: new Point({ x: off_x, y: off_y }),
              mousePosition: new Point({ x: mouseX, y: mouseY }),
            };
          });
        }}
      />

      {/* Minimap canvas */}
      <div className="fixed bottom-0 right-0 outline-solid m-3">
        <p
          className={`absolute -top-6 w-full text-center ${infoMenu ? "select-none" : ""}`}
        >
          View: <b>{Set[state.view.mini]}</b>
        </p>
        <canvas
          ref={miniCanvasRef}
          width={window.innerWidth / 3.5}
          height={window.innerHeight / 3.5}
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
        <div
          className={`fixed z-5 left-1 bottom-0 ${infoMenu ? "select-none" : ""}`}
        >
          Offset:{" "}
          <MathJax inline>
            <div className="inline" ref={offsetRef}>
              {offsetLabel}
            </div>
          </MathJax>
        </div>
      </MathJaxContext>
    </>
  );
};

export default App;
