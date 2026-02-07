import { useRef, useEffect, useState, useLayoutEffect } from 'react';
import vertexShaderSource from './shaders/vertex.glsl?url'
import mbFragShaderSource from './shaders/mandelbrot_frag.glsl?url'
import jFragShaderSource from './shaders/julia_frag.glsl?url'

function App() {
  const [fidelity, setFidelity] = useState(1.0);
  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });
  const [dynamic, setDynamic] = useState(false);
  const canvasRef = useRef(null);
  const miniCanvasRef = useRef(null);
  const [config, setConfig] = useState({
    main: "Mandelbrot",
    mini: "Julia",
  })

  const render = async (ref, type) => {
    
    const canvas = ref.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let vertices = [
      0.0, 0.0, 0.0, // origin
      -1.0, 1.0, 0.0, // top left
      1.0, 1.0, 0.0, // top right
      -1.0, -1.0, 0.0, // bottom left
      1.0, -1.0, 0.0, // botton right
    ]

    let indices = [1, 2, 3, 2, 3, 4]

    let vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    const vsSource = await fetch(vertexShaderSource).then(res => res.text())
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    let fsSource = await fetch(type === "Mandelbrot" ? mbFragShaderSource : jFragShaderSource).then(res => res.text())
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
    let coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');
    gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordinates);

    let uResLoc = gl.getUniformLocation(shaderProgram, 'u_resolution');
    gl.uniform2f(uResLoc, canvas.width, canvas.height);

    let uRatioLoc = gl.getUniformLocation(shaderProgram, 'u_ratio');
    gl.uniform1f(uRatioLoc, window.innerWidth/window.innerHeight);

    let uZ0Loc = gl.getUniformLocation(shaderProgram, 'u_z0');
    gl.uniform2f(uZ0Loc, mousePos.x, mousePos.y);

    gl.clearColor(0.5, 0.5, 1.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  // OpenGL rendering
  useEffect(() => {
    render(canvasRef, config.main);
    render(miniCanvasRef, config.mini);
  }, [mousePos, config]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={fidelity*window.innerHeight}
        height={fidelity*window.innerWidth}
        className="w-screen h-screen"
        onClick={() => {
          setDynamic(!dynamic);
          console.log(dynamic)
        }}
        onContextMenu={(e) => {
          e.preventDefault();

          setConfig({
            main: config.mini,
            mini: config.main,
          })
        }}
        onMouseMove={(e) => {
          const pos = {
            x: (2*e.clientX - window.innerWidth)/window.innerWidth,
            y: (window.innerHeight - 2*e.clientY)/window.innerHeight,
          }

          const coords = {
            x: 2.0*pos.x,
            y: pos.y,
          }

          if (dynamic) setMousePos(coords);
        }}
      />

      <canvas
        ref={miniCanvasRef}
        width={window.innerWidth/5.0}
        height={window.innertHeight/4.0}
        className="fixed bottom-0 right-0 outline-solid m-3"
      />

      <div className="fixed top-0 left-0">
        <p>{`${config.main === "Mandelbrot" ? "z_0" : "c"}: ${mousePos.x.toFixed(3)} ${mousePos.y >= 0 ? "+" : "-"} ${Math.abs(mousePos.y.toFixed(3))}i`}</p>
        <p>Dynamic: {dynamic ? "ON" : "OFF"}</p>
      </div>

      <div className="fixed top-0 left-0 w-full text-center text-2xl">
        {config.main}
      </div>
    </>
  )
}

export default App
