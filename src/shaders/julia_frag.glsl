precision highp float;
uniform vec2 u_resolution;
uniform float u_ratio;
uniform vec2 u_z0;

void main(void) {
  vec4 coords = vec4(2.0*gl_FragCoord.x/u_resolution.x - 1.0, 2.0*gl_FragCoord.y/u_resolution.y - 1.0, 0.0, 1.0);
  coords = vec4(coords.x*u_ratio, coords.yzw);

  // For Mandelbrot sets
  // c
  // float x0 = coords.x; 
  // float y0 = coords.y;

  // z_0
  // float x = u_z0.x; 
  // float y = u_z0.y; 

  float iteration = 0.0;

  // For Julia sets
  // z_0
  float x0 = u_z0.x;
  float y0 = u_z0.y;

  // c 
  float x = coords.x;
  float y = coords.y;

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
