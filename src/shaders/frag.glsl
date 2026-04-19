precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_input;
uniform int u_is_mandelbrot;
uniform int u_is_main_view;

void main(void) {
  // Window-relative pixel to Argand-coords
  vec4 coords = vec4(2.0*gl_FragCoord.x/u_resolution.x - 1.0, 2.0*gl_FragCoord.y/u_resolution.y - 1.0, 0.0, 1.0);
  // Scale by display ratio to maintain 1:1 opengl to argand mapping
  coords = vec4(coords.x / (u_resolution.x / u_resolution.y) * (u_is_main_view == 1 ? 1.0 : 5.0), coords.yzw);

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
  for (int i = 0; i < 10000; i++) {
    // If diverges before iteration limit, exit loop
    if (x*x + y*y > 4.0) break;

    // Iterate recurrence relation
    float xtemp = x*x - y*y + x0;
    y = 2.0*x*y + y0;
    x = xtemp;

    iteration++;
  }

  // Color black if in mandelbrot set (did not diverge after 10,000 iterations)
  // Color blue if diverged quickly
  // Color yellow if diverged slowly
  vec4 color;
  if (iteration >= 10000.0) color = vec4(0.0, 0.0, 0.0, 1.0);
  else if (iteration >= 50.0) color = vec4(1.0, 1.0, 0.0, 1.0);
  else color = vec4(0.0, 0.0, 1.0, 1.0);

  gl_FragColor = color;
}
