precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_input;
uniform vec2 u_offset;
uniform float u_zoom;
uniform int u_is_mandelbrot;
uniform int u_is_main_view;
uniform int u_iterations;

void main(void) {
  // Window-relative pixel to Argand-coords
  vec4 coords = vec4(2.0*gl_FragCoord.x/u_resolution.x - 1.0, 2.0*gl_FragCoord.y/u_resolution.y - 1.0, 0.0, 1.0);
  // Scale by display ratio to maintain 1:1 opengl to argand mapping
  coords = vec4(coords.x * (u_resolution.x / u_resolution.y), coords.yzw);
  // Apply zoom 
  coords = vec4(coords.x / u_zoom, coords.y / u_zoom, coords.zw);
  // Offset coords 
  coords = vec4(coords.x - u_offset.x, coords.y - u_offset.y, coords.zw);

  float x, y, x0, y0;

  if (u_is_mandelbrot == 1) 
  {
    // Set Mandelbrot parameters

    // c
    x0 = coords.x; 
    y0 = coords.y;

    // z_0
    x = u_input.x; 
    y = u_input.y; 
  }
  else
  {
    // Set Julia parameters

    // z_0
    x0 = u_input.x; 
    y0 = u_input.y;

    // c
    x = coords.x; 
    y = coords.y; 
  }

  float iteration = 0.0;

  // Emulating z_{n+1} = z_{n}^2 + c where c := x + yi
  for (int i = 0; i < 0xFFFF; i++) {
    // If diverges before iteration limit, exit loop
    if (x*x + y*y > 4.0) break;

    // Iterate recurrence relation
    float xtemp = x*x - y*y + x0;
    y = 2.0*x*y + y0;
    x = xtemp;

    iteration++;

    // Due to WebGL restriction, cannot include variable in loop condition. Break out of loop if counter surpoasses uniform value
    if (i >= u_iterations) break;
  }

  // Color black if in mandelbrot set (did not diverge after max iterations)
  // Color blue if diverged quickly
  // Color yellow if diverged slowly
  vec4 color;
  if (iteration >= float(u_iterations)) color = vec4(0.0, 0.0, 0.0, 1.0);
  else if (iteration >= 50.0) color = vec4(1.0, 1.0, 0.0, 1.0);
  else color = vec4(0.0, 0.0, 1.0, 1.0);

  gl_FragColor = color;
}
