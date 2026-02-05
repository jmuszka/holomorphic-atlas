import { useRef, useEffect, useState } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let vertices = [
      0.0, 0.0, 0.0, // origin
      1.0, 0.0, 0.0, // right midpoint
      -1.0, 0.0, 0.0, // left midpoint
      0.0, 1.0, 0.0, // top midpoint 
      0.0, -1.0, 0.0, // bottom midpoint
    ]

    let indices = [0, 2, 3]

    let vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    let vsSource = 
      'attribute vec3 coordinates;' +
				
      'void main(void) {' +
        ' gl_Position = vec4(coordinates, 1.0);' +
      '}';
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    let fsSource =
      'void main(void) {' +
        ' gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);' +
      '}';
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

    gl.clearColor(0.5, 0.5, 1.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={size.width}
      height={size.height}
    />
  )
}

export default App
