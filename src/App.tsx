import { useRef, useEffect, useState } from 'react';
import vertexShaderSource from './shaders/vertex.glsl?url'
import fragmentShaderSource from './shaders/fragment.glsl?url'

function App() {
  const [fidelity, setFidelity] = useState(1.0);
  const canvasRef = useRef(null);

  const render = async () => {
    const canvas = canvasRef.current;
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

    let fsSource = await fetch(fragmentShaderSource).then(res => res.text())
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

    gl.clearColor(0.5, 0.5, 1.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  // OpenGL rendering
  useEffect(() => {
    render();
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={fidelity*window.innerHeight}
      height={fidelity*window.innerWidth}
      className={`w-screen h-screen`}
    />
  )
}

export default App
