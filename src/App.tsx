import { useRef, useEffect, useState, useMemo } from "react";
import Toast from "./components/toast";
import {
  render,
  renderHistogramPass1,
  buildHistogramLUT,
  renderHistogramPass2,
  initGL,
  type GLContext,
} from "./shaders/render";
import { Point, toComplex } from "./utils/position";
import InfoMenu from "./components/info-menu";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { isMobile } from "./utils/is-mobile";
import { useApp } from "./stores/app-context";
import ControlPanel from "./components/control-panel";
import DPad from "./components/d-pad";
import ZoomControls from "./components/zoom-controls";
import { Set } from "./types/set";
import { ColoringAlgorithm } from "./types/coloring-algorithm";

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

  const stateRef = useRef(state);
  const dirtyRef = useRef(true);
  const tileRef = useRef(0);
  const tileOrderRef = useRef<number[]>([]);
  const miniTileRef = useRef(0);
  const miniTileOrderRef = useRef<number[]>([]);
  const histoPhaseRef = useRef(0);
  const miniHistoPhaseRef = useRef(0);

  // Sync latest state into ref so the rAF loop always sees it without re-subscribing
  useEffect(() => {
    stateRef.current = state;
    dirtyRef.current = true;
  }, [state]);

  // rAF loop: renders the main canvas in TILE_SIZE×TILE_SIZE tiles, TILES_PER_FRAME
  // per frame, so heavy renders stay responsive and can't trigger GPU timeout
  useEffect(() => {
    const TILE_SIZE = 128;
    const TILES_PER_FRAME = 4;

    const ensureGL = (
      ref: React.RefObject<HTMLCanvasElement | null>,
      glRef: React.MutableRefObject<GLContext | null>,
    ) => {
      if (
        ref.current &&
        (!glRef.current || glRef.current.gl.canvas !== ref.current)
      ) {
        glRef.current = initGL(ref.current);
      }
    };

    const buildOrder = (w: number, h: number) => {
      const cols = Math.ceil(w / TILE_SIZE);
      const rows = Math.ceil(h / TILE_SIZE);
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      return Array.from({ length: cols * rows }, (_, i) => i).sort((a, b) => {
        const ax = (a % cols) - cx,
          ay = Math.floor(a / cols) - cy;
        const bx = (b % cols) - cx,
          by = Math.floor(b / cols) - cy;
        return ax * ax + ay * ay - (bx * bx + by * by);
      });
    };

    // Render up to TILES_PER_FRAME tiles using the provided per-tile function.
    // Returns true when all tiles for this canvas are done.
    const renderTiles = (
      canvas: HTMLCanvasElement,
      tileIdxRef: React.MutableRefObject<number>,
      orderRef: React.MutableRefObject<number[]>,
      renderTile: (tile: {
        x: number;
        y: number;
        w: number;
        h: number;
      }) => void,
    ): boolean => {
      const cols = Math.ceil(canvas.width / TILE_SIZE);
      const total = cols * Math.ceil(canvas.height / TILE_SIZE);
      for (let i = 0; i < TILES_PER_FRAME && tileIdxRef.current < total; i++) {
        const t = orderRef.current[tileIdxRef.current++];
        const col = t % cols;
        const row = Math.floor(t / cols);
        renderTile({
          x: col * TILE_SIZE,
          y: row * TILE_SIZE,
          w: Math.min(TILE_SIZE, canvas.width - col * TILE_SIZE),
          h: Math.min(TILE_SIZE, canvas.height - row * TILE_SIZE),
        });
      }
      return tileIdxRef.current >= total;
    };

    let rafId: number;
    const loop = () => {
      ensureGL(canvasRef, mainGLRef);
      ensureGL(miniCanvasRef, miniGLRef);
      const glCtx = mainGLRef.current;
      const miniGlCtx = miniGLRef.current;
      const canvas = canvasRef.current;
      const miniCanvas = miniCanvasRef.current;

      if (dirtyRef.current) {
        dirtyRef.current = false;
        tileRef.current = 0;
        miniTileRef.current = 0;
        histoPhaseRef.current = 0;
        miniHistoPhaseRef.current = 0;
        if (canvas)
          tileOrderRef.current = buildOrder(canvas.width, canvas.height);
        if (miniCanvas)
          miniTileOrderRef.current = buildOrder(
            miniCanvas.width,
            miniCanvas.height,
          );
      }

      const s = stateRef.current;

      if (glCtx && canvas) {
        if (s.coloringAlgorithm === ColoringAlgorithm.Histogram) {
          if (histoPhaseRef.current === 0) {
            const done = renderTiles(canvas, tileRef, tileOrderRef, (tile) =>
              renderHistogramPass1(glCtx, s, true, tile),
            );
            if (done) {
              buildHistogramLUT(glCtx, s);
              histoPhaseRef.current = 1;
              tileRef.current = 0;
            }
          } else {
            renderTiles(canvas, tileRef, tileOrderRef, (tile) =>
              renderHistogramPass2(glCtx, s, true, tile),
            );
          }
        } else {
          renderTiles(canvas, tileRef, tileOrderRef, (tile) =>
            render(glCtx, s, true, tile),
          );
        }
      }

      if (miniGlCtx && miniCanvas) {
        if (s.coloringAlgorithm === ColoringAlgorithm.Histogram) {
          if (miniHistoPhaseRef.current === 0) {
            const done = renderTiles(
              miniCanvas,
              miniTileRef,
              miniTileOrderRef,
              (tile) => renderHistogramPass1(miniGlCtx, s, false, tile),
            );
            if (done) {
              buildHistogramLUT(miniGlCtx, s);
              miniHistoPhaseRef.current = 1;
              miniTileRef.current = 0;
            }
          } else {
            renderTiles(miniCanvas, miniTileRef, miniTileOrderRef, (tile) =>
              renderHistogramPass2(miniGlCtx, s, false, tile),
            );
          }
        } else {
          renderTiles(miniCanvas, miniTileRef, miniTileOrderRef, (tile) =>
            render(miniGlCtx, s, false, tile),
          );
        }
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

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

  const miniWidth = Math.floor(window.innerWidth / 3.5);
  const miniHeight = Math.floor(window.innerHeight / 3.5);

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
      <div className="fixed bottom-0 right-0 m-3 flex flex-col items-center gap-1 z-20">
        <p
          className={`${infoMenu ? "select-none" : ""} text-white text-sm font-medium`}
        >
          View: <b>{Set[state.view.mini]}</b>
        </p>
        <div
          className="outline-solid outline-slate-400/30 rounded-3xl overflow-hidden bg-slate-900/50 backdrop-blur-sm"
          style={{ width: miniWidth, height: miniHeight }}
        >
          <canvas
            ref={miniCanvasRef}
            width={miniWidth}
            height={miniHeight}
            className="block w-full h-full"
          />
        </div>
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
