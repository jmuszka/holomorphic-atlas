import { Set } from "../types/set";
import { type MapState } from "../stores/map-state";

import vertexShaderSource from "./vertex.glsl?url";
import fragShaderSource from "./frag.glsl?url";

export const render = async (
  ref: React.RefObject<any>,
  state: MapState,
  isMainView: boolean,
) => {
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

  // TODO: prefetch this for better performance
  let fsSource = await fetch(fragShaderSource).then((res) => res.text());
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

  let uZ0Loc = gl.getUniformLocation(shaderProgram, "u_input");
  gl.uniform2f(
    uZ0Loc,
    state.position.toArgand().re,
    state.position.toArgand().im,
  );

  let uIsMandelbrotLoc = gl.getUniformLocation(
    shaderProgram,
    "u_is_mandelbrot",
  );
  gl.uniform1i(
    uIsMandelbrotLoc,
    (isMainView ? state.view.main : state.view.mini) === Set.MANDELBROT,
  );

  // TODO: pass in the scale value; magic numbers are present
  let uIsMainViewLoc = gl.getUniformLocation(shaderProgram, "u_is_main_view");
  gl.uniform1i(uIsMainViewLoc, isMainView);

  gl.clearColor(0.5, 0.5, 1.0, 0.9);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
};
