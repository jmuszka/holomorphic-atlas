#version 300 es
#define INT_MAX 0x7FFFFFFF
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_input;
uniform vec2 u_offset;
uniform float u_zoom;
uniform int u_is_mandelbrot;
uniform int u_is_main_view;
uniform int u_max_iterations;
out vec4 outputColor;

// The idea beind this algorithm is to count how many iterations of the recursive relation it takes to make the point on the screen diverge. If it doesn't diverge before the maximum iteration limit, we assume it is in the Mandelbrot set. Points are colored according to their divergence speed
vec4 escape_time(float x, float y, float x0, float y0)
{
  int iteration = 0;

  // Emulating z_{n+1} = z_{n}^2 + c where c := x + yi
  for (int i = 0; i < INT_MAX; i++) 
  {
    // If diverges before iteration limit (modulus > 2), exit loop
    if (x*x + y*y > 4.0 || iteration >= u_max_iterations) break;

    // Iterate recurrence relation
    float xtemp = x*x - y*y + x0;
    y = 2.0*x*y + y0;
    x = xtemp;
    iteration++;
  }

  // Coloring algorithm
  // Color black if in mandelbrot set (did not diverge after max iterations)
  // Color blue if diverged quickly
  // Color yellow if diverged slowly
  vec4 color;
  if (iteration >= u_max_iterations) color = vec4(0.0, 0.0, 0.0, 1.0);
  else if (iteration >= 50) color = vec4(1.0, 1.0, 0.0, 1.0);
  else color = vec4(0.0, 0.0, 1.0, 1.0);

  return color;
}

void main(void)
{
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

  outputColor = escape_time(x, y, x0, y0);
}
