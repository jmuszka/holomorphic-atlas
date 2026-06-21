import { type MapState } from "../stores/map-state";
import { ColoringAlgorithm } from "../types/coloring-algorithm";

import vertexShaderSource from "./vertex.glsl?url";
import fragShaderSource from "./frag.glsl?url";

import Stats from "stats-gl";
import { isMobile } from "../utils/is-mobile";

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
    view: WebGLUniformLocation;
    isMainView: WebGLUniformLocation;
    iterations: WebGLUniformLocation;
    p: WebGLUniformLocation;
    experimental: WebGLUniformLocation;
    coloringAlgorithm: WebGLUniformLocation;
    histogramPass: WebGLUniformLocation;
    lut: WebGLUniformLocation;
    lutSize: WebGLUniformLocation;
  };
  buffers: {
    vertex: WebGLBuffer;
    index: WebGLBuffer;
  };
  indexCount: number;
  histogram: {
    fb: WebGLFramebuffer;
    iterTex: WebGLTexture;
    iterTexSize: { width: number; height: number };
    lutTex: WebGLTexture;
  };
}

// Performance monitoring
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stats: any = new Stats({ trackGPU: true });
const canvas = document.querySelector("#main-canvas");
stats.dom.id = "stats";
stats.dom.style.left = "";
stats.dom.style.right = "270px";
stats.dom.style.zIndex = "5";
stats.init(canvas);

if (!isMobile) document.body.appendChild(stats.dom);
else stats = null;

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
    view: gl.getUniformLocation(shaderProgram, "u_view")!,
    isMainView: gl.getUniformLocation(shaderProgram, "u_is_main_view")!,
    iterations: gl.getUniformLocation(shaderProgram, "u_max_iterations")!,
    p: gl.getUniformLocation(shaderProgram, "u_p")!,
    experimental: gl.getUniformLocation(shaderProgram, "u_experimental")!,
    coloringAlgorithm: gl.getUniformLocation(
      shaderProgram,
      "u_coloring_algorithm",
    )!,
    histogramPass: gl.getUniformLocation(shaderProgram, "u_histogram_pass")!,
    lut: gl.getUniformLocation(shaderProgram, "u_lut")!,
    lutSize: gl.getUniformLocation(shaderProgram, "u_lut_size")!,
  };

  // Histogram resources
  const histogramFb = gl.createFramebuffer();
  if (!histogramFb) return null;

  const iterTex = gl.createTexture();
  if (!iterTex) return null;
  gl.bindTexture(gl.TEXTURE_2D, iterTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const lutTex = gl.createTexture();
  if (!lutTex) return null;
  gl.bindTexture(gl.TEXTURE_2D, lutTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Upload a 1×1 placeholder so the texture is valid before first histogram render
  const gl2 = gl as unknown as WebGL2RenderingContext;
  gl2.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl2.R32F,
    1,
    1,
    0,
    gl2.RED,
    gl.FLOAT,
    new Float32Array([0]),
  );
  gl.bindTexture(gl.TEXTURE_2D, null);

  return {
    gl,
    program: shaderProgram,
    uniformLocations,
    buffers: {
      vertex: vb,
      index: ib,
    },
    indexCount: indices.length,
    histogram: {
      fb: histogramFb,
      iterTex,
      iterTexSize: { width: 0, height: 0 },
      lutTex,
    },
  };
};

export const render = (
  glContext: GLContext,
  state: MapState,
  isMainView: boolean,
) => {
  stats?.begin(); // begin performance monitoring

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
    state.mousePosition.openGl().x,
    state.mousePosition.openGl().y,
  );

  gl.uniform2f(
    uniformLocations.offset,
    state.canvasOffset.openGl().x,
    state.canvasOffset.openGl().y,
  );

  gl.uniform1f(uniformLocations.zoom, state.zoom);

  gl.uniform1i(
    uniformLocations.view,
    isMainView ? state.view.main : state.view.mini,
  );

  gl.uniform1i(uniformLocations.isMainView, isMainView ? 1 : 0);

  gl.uniform1i(uniformLocations.iterations, state.iterations);

  gl.uniform1i(uniformLocations.p, state.p);

  gl.uniform1i(uniformLocations.experimental, state.experimental ? 1 : 0);

  gl.uniform1i(uniformLocations.coloringAlgorithm, state.coloringAlgorithm);

  if (state.coloringAlgorithm === ColoringAlgorithm.Histogram) {
    const { fb, iterTex, iterTexSize, lutTex } = glContext.histogram;
    const gl2 = gl as unknown as WebGL2RenderingContext;

    // Resize iteration-count texture if the canvas size changed
    if (
      iterTexSize.width !== canvas.width ||
      iterTexSize.height !== canvas.height
    ) {
      gl.bindTexture(gl.TEXTURE_2D, iterTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        canvas.width,
        canvas.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      iterTexSize.width = canvas.width;
      iterTexSize.height = canvas.height;
    }

    // Bind lutTex to TEXTURE0 before pass 1 — iterTex must not be bound to any
    // sampler unit while it is also the framebuffer render target (feedback loop).
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lutTex);

    // Pass 1: render packed iteration counts to offscreen framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      iterTex,
      0,
    );
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(uniformLocations.histogramPass, 0);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

    // Read back iteration counts (R = low byte, G = high byte → iter = R + G*256)
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(
      0,
      0,
      canvas.width,
      canvas.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    );

    // Build histogram then compute CDF
    const maxIter = state.iterations;
    const histogram = new Int32Array(maxIter);
    let total = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const iter = pixels[i] + pixels[i + 1] * 256;
      if (iter < maxIter) {
        histogram[iter]++;
        total++;
      }
    }
    const lut = new Float32Array(maxIter);
    let cumulative = 0;
    for (let i = 0; i < maxIter; i++) {
      cumulative += histogram[i];
      lut[i] = total > 0 ? cumulative / total : 0;
    }

    // Upload CDF as a maxIter×1 float texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lutTex);
    gl2.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl2.R32F,
      maxIter,
      1,
      0,
      gl2.RED,
      gl.FLOAT,
      lut,
    );

    // Pass 2: render final colors to screen using LUT
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 1.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(uniformLocations.histogramPass, 1);
    gl.uniform1i(uniformLocations.lut, 0);
    gl.uniform1i(uniformLocations.lutSize, maxIter);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
  } else {
    gl.uniform1i(uniformLocations.histogramPass, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.5, 0.5, 1.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
  }

  // Publish performance metrics
  stats?.end();
  stats?.update();
};
