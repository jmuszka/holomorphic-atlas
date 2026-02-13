import { useRef, useEffect, useState, useLayoutEffect } from "react";
import Set from "./types/set";
import MapState, {
  defaultState,
  loadURLState,
  updateURLState,
} from "./stores/map-state";
import vertexShaderSource from "./shaders/vertex.glsl?url";
import mbFragShaderSource from "./shaders/mandelbrot_frag.glsl?url";
import jFragShaderSource from "./shaders/julia_frag.glsl?url";

const App = () => {
  const canvasRef = useRef(null);
  const miniCanvasRef = useRef(null);

  const [state, setState] = useState<MapState>(loadURLState());

  const render = async (ref, type) => {
    const canvas = ref.current;
    const gl = canvas.getContext("webgl");

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let vertices = [
      0.0,
      0.0,
      0.0, // origin
      -1.0,
      1.0,
      0.0, // top left
      1.0,
      1.0,
      0.0, // top right
      -1.0,
      -1.0,
      0.0, // bottom left
      1.0,
      -1.0,
      0.0, // botton right
    ];

    let indices = [1, 2, 3, 2, 3, 4];

    let vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    const vsSource = await fetch(vertexShaderSource).then((res) => res.text());
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    let fsSource = await fetch(
      type === Set.MANDELBROT ? mbFragShaderSource : jFragShaderSource,
    ).then((res) => res.text());
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vs);
    gl.attachShader(shaderProgram, fs);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    let coordinates = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordinates);

    let uResLoc = gl.getUniformLocation(shaderProgram, "u_resolution");
    gl.uniform2f(uResLoc, canvas.width, canvas.height);

    let uRatioLoc = gl.getUniformLocation(shaderProgram, "u_ratio");
    gl.uniform1f(uRatioLoc, window.innerWidth / window.innerHeight);

    let uZ0Loc = gl.getUniformLocation(shaderProgram, "u_z0");
    gl.uniform2f(uZ0Loc, state.point.re, state.point.im);

    gl.clearColor(0.5, 0.5, 1.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  };

  // Init
  useLayoutEffect(() => {
    setState(loadURLState());
  }, []);

  useEffect(() => {
    // OpenGL rendering
    render(canvasRef, state.view.main);
    render(miniCanvasRef, state.view.mini);
  }, [state]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={state.fidelity * window.innerHeight}
        height={state.fidelity * window.innerWidth}
        className="w-screen h-screen"
        onClick={() => {
          setState({
            ...state,
            dynamic: !state.dynamic,
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
          // TODO: clear conversion between mouse coords to point on argand plane

          const pos = {
            x: (2 * e.clientX - window.innerWidth) / window.innerWidth,
            y: (window.innerHeight - 2 * e.clientY) / window.innerHeight,
          };

          const coords = {
            re: 2.0 * pos.x,
            im: pos.y,
          };

          if (state.dynamic)
            setState({
              ...state,
              point: coords,
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
        />
      </div>

      <div className="fixed top-0 left-0 bg-gray-500/80 p-3 m-1 rounded-xl">
        <p>
          View: <b>{state.view.main}</b>
        </p>
        <p>
          Fidelity: <b>{state.fidelity.toFixed(1)}</b>
        </p>
        <p>
          Point:{" "}
          <b>
            {state.point.re.toFixed(3)} {state.point.im >= 0 ? "+" : "-"}{" "}
            {Math.abs(state.point.im).toFixed(3)}i
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
          <button onClick={() => {
            setState(defaultState);
            updateURLState(null);           
          }}>
            Reset
          </button>
          <button onClick={() => {
            updateURLState(state);
          }}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
