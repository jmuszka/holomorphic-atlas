import { Set } from "../types/set";
import { type MapState } from "../stores/map-state";

import vertexShaderSource from "./vertex.glsl?url";
import fragShaderSource from "./frag.glsl?url";

import Stats from "stats-gl";

const vsSource = await fetch(vertexShaderSource).then((res) => res.text());
const fsSource = await fetch(fragShaderSource).then((res) => res.text());

export interface GLContext {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  uniformLocations: {
    resolution: WebGLUniformLocation;
    input: WebGLUniformLocation;
    offset: WebGLUniformLocation;
    zoom: WebGLUniformLocation;
    isMandelbrot: WebGLUniformLocation;
    isMainView: WebGLUniformLocation;
    iterations: WebGLUniformLocation;
  };
  buffers: {
    vertex: WebGLBuffer;
    index: WebGLBuffer;
  };
  indexCount: number;
}

// Performance monitoring
const stats = new Stats({ trackGPU: true });
const canvas = document.querySelector("#main-canvas");
stats.dom.id = "stats";
stats.dom.style.left = "";
stats.dom.style.right = "270px";
stats.dom.style.zIndex = "5";
stats.init(canvas);

document.body.appendChild(stats.dom);

export const initGL = (canvas: HTMLCanvasElement): GLContext | null => {
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    console.error("WebGL not supported");
    return null;
  }

  const vertices = [
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

  const indices = [1, 2, 3, 2, 3, 4];

  const vb = gl.createBuffer();
  if (!vb) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const ib = gl.createBuffer();
  if (!ib) return null;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW,
  );

  const vs = gl.createShader(gl.VERTEX_SHADER);
  if (!vs) return null;
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fs) return null;
  gl.shaderSource(fs, fsSource);
  gl.compileShader(fs);

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) return null;
  gl.attachShader(shaderProgram, vs);
  gl.attachShader(shaderProgram, fs);
  gl.linkProgram(shaderProgram);

  const uniformLocations = {
    resolution: gl.getUniformLocation(shaderProgram, "u_resolution")!,
    input: gl.getUniformLocation(shaderProgram, "u_input")!,
    offset: gl.getUniformLocation(shaderProgram, "u_offset")!,
    zoom: gl.getUniformLocation(shaderProgram, "u_zoom")!,
    isMandelbrot: gl.getUniformLocation(shaderProgram, "u_is_mandelbrot")!,
    isMainView: gl.getUniformLocation(shaderProgram, "u_is_main_view")!,
    iterations: gl.getUniformLocation(shaderProgram, "u_iterations")!,
  };

  return {
    gl,
    program: shaderProgram,
    uniformLocations,
    buffers: {
      vertex: vb,
      index: ib,
    },
    indexCount: indices.length,
  };
};

export const render = (
  glContext: GLContext,
  state: MapState,
  isMainView: boolean,
) => {
  stats.begin(); // begin performance monitoring

  const { gl, program, uniformLocations, buffers, indexCount } = glContext;
  const canvas = gl.canvas as HTMLCanvasElement;

  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

  const coordinates = gl.getAttribLocation(program, "coordinates");
  gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);

  gl.uniform2f(uniformLocations.resolution, canvas.width, canvas.height);

  gl.uniform2f(
    uniformLocations.input,
    state.position.toArgand().re,
    state.position.toArgand().im,
  );

  gl.uniform2f(
    uniformLocations.offset,
    state.offset.toArgand().re,
    state.offset.toArgand().im,
  );

  gl.uniform1f(uniformLocations.zoom, state.zoom);

  gl.uniform1i(
    uniformLocations.isMandelbrot,
    (isMainView ? state.view.main : state.view.mini) === Set.MANDELBROT ? 1 : 0,
  );

  gl.uniform1i(uniformLocations.isMainView, isMainView ? 1 : 0);

  gl.uniform1i(uniformLocations.iterations, state.iterations);

  gl.clearColor(0.5, 0.5, 1.0, 0.9);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

  // Publish performance metrics
  stats.end();
  stats.update();
};
