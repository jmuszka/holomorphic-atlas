import { useRef, useEffect, useState } from 'react';

function App() {
  const [fidelity, setFidelity] = useState(1.0);
  const canvasRef = useRef(null);

  // OpenGL rendering
  useEffect(() => {
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

    let vsSource = 
      'attribute vec3 coordinates;' +
				
      'void main(void) {' +
        ' gl_Position = vec4(coordinates, 1.0);' +
      '}';
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    let fsSource =
      'precision highp float;' +
      'uniform vec2 u_resolution;' +

      'void main(void) {' +
        'vec4 coords = vec4(2.0*gl_FragCoord.x/u_resolution.x - 1.0, 2.0*gl_FragCoord.y/u_resolution.y - 1.0, 0.0, 1.0);' +
        `coords = vec4(coords.x*(${window.innerWidth/window.innerHeight}), coords.yzw);` +

        'float x0 = coords.x; float y0 = coords.y;' +
        'float x = 0.0; float y = 0.0; float iteration = 0.0;' +

        'for (int i = 0; i < 10000; i++) {' +
          'if (x*x + y*y > 4.0) break;' +
          'float xtemp = x*x - y*y + x0;' +
          'y = 2.0*x*y + y0;' +
          'x = xtemp;' +
          'iteration++;' +
        '}' +

        `vec4 color;` +
        'if (iteration >= 10000.0) color = vec4(0.0, 0.0, 0.0, 1.0);' +
        'else if (iteration >= 50.0) color = vec4(1.0, 1.0, 0.0, 1.0);' +
        'else color = vec4(0.0, 0.0, 1.0, 1.0);' +

        'gl_FragColor = color;' +
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

    let uResLoc = gl.getUniformLocation(shaderProgram, 'u_resolution');
    gl.uniform2f(uResLoc, canvas.width, canvas.height);

    gl.clearColor(0.5, 0.5, 1.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
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
