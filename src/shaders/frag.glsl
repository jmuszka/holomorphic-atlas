#version 300 es
precision highp float;
precision highp int;

#define INT_MAX 0x7FFFFFFF
uniform vec2 u_resolution;
uniform vec2 u_input;
uniform vec2 u_offset;
uniform float u_zoom;
uniform int u_view;
uniform int u_max_iterations;
uniform int u_p;
uniform int u_experimental;
uniform int u_coloring_algorithm;
uniform int u_histogram_pass;
uniform sampler2D u_lut;
uniform int u_lut_size;
out vec4 outputColor;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 lch2rgb(vec3 lch) {
  // LCH → LAB
  float h = lch.z * 3.14159265 / 180.0;
  vec3 lab = vec3(lch.x, lch.y * cos(h), lch.y * sin(h));

  // LAB → XYZ (D65 white point)
  float fy = (lab.x + 16.0) / 116.0;
  float fx = lab.y / 500.0 + fy;
  float fz = fy - lab.z / 200.0;
  const float d = 6.0 / 29.0;
  float x = fx > d ? fx*fx*fx : 3.0*d*d*(fx - 4.0/29.0);
  float y = fy > d ? fy*fy*fy : 3.0*d*d*(fy - 4.0/29.0);
  float z = fz > d ? fz*fz*fz : 3.0*d*d*(fz - 4.0/29.0);
  vec3 xyz = vec3(x * 0.95047, y * 1.00000, z * 1.08883);

  // XYZ → linear sRGB
  vec3 lin;
  lin.r =  3.2406*xyz.x - 1.5372*xyz.y - 0.4986*xyz.z;
  lin.g = -0.9689*xyz.x + 1.8758*xyz.y + 0.0415*xyz.z;
  lin.b =  0.0557*xyz.x - 0.2040*xyz.y + 1.0570*xyz.z;

  // Linear → gamma-corrected sRGB, clamped to [0,1]
  lin = clamp(lin, 0.0, 1.0);
  vec3 lo = lin * 12.92;
  vec3 hi = 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), lin));
}

// The idea beind this algorithm is to count how many iterations of the recursive relation it takes to make the point on the screen diverge. If it doesn't diverge before the maximum iteration limit, we assume it is in the Mandelbrot set. Points are colored according to their divergence speed
vec4 escape_time(float x, float y, float x0, float y0)
{
  int iteration = 0;

  // Bounding-circle shortcut for any p (Mandelbrot view only).
  // r_p = ((p-1)/p) * (1/p)^(1/(p-1)) is the radius of the largest open disk
  // centered at the origin that lies entirely within the period-1 attractor region.
  // Grows toward 1 as p --> infinity. Any c inside is provably non-escaping.
  if (u_view == 0 && u_experimental == 0) {
    float fp = float(u_p);
    float rp = ((fp - 1.0) / fp) * pow(1.0 / fp, 1.0 / (fp - 1.0));
    if (x0*x0 + y0*y0 < rp * rp) {
      iteration = u_max_iterations;
    }
  }

  // Emulating z_{n+1} = z_{n}^2 + c where c := x + yi
  if (iteration < u_max_iterations) for (int i = 0; i < INT_MAX; i++)
  {
    // If diverges before iteration limit (modulus > p^2), exit loop
    if (x*x + y*y > float(u_p)*float(u_p) || iteration >= u_max_iterations) break;

    // Iterate recurrence relation
    float temp;
    float a = x;
    float b = y;

    // Multiply
    for (int j = 1; j < u_p; j++)
    {
        temp = a*x - b*y;
        b = a*y + b*x;
        a = temp;
    }

    // Add constant
    x = a + x0;
    y = b + y0;

    iteration++;
  }

  // Coloring algorithm
  // Color black if in mandelbrot set (did not diverge after max iterations)
  // Color blue if diverged quickly
  // Color yellow if diverged slowly

  vec4 color;
  switch (u_coloring_algorithm)
  {
    case 0: // Histogram (equalized escape time)
      if (u_histogram_pass == 0) {
        // Pack 16-bit iteration count into RG for CPU readback
        color = vec4(float(iteration % 256) / 255.0, float(iteration / 256) / 255.0, 0.0, 1.0);
      } else {
        if (iteration >= u_max_iterations) {
          color = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          float t = texture(u_lut, vec2((float(iteration) + 0.5) / float(u_lut_size), 0.5)).r;
          vec3 rgb = 0.5 + 0.5 * tan(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
          color = vec4(rgb, 1.0);
        }
      }
      break;
    case 1: // Continuous (smooth escape time)
      if (iteration >= u_max_iterations) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        float log_zn = 0.5 * log(x*x + y*y);
        float log_p = log(float(u_p));
        float nu = log(log_zn / log_p) / log_p;
        float mu = float(iteration) + 1.0 - nu;

        float t = fract(mu * 0.05);
        vec3 rgb = 0.5 + 0.5 * tan(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
        color = vec4(rgb, 1.0);
      }
      break;
    case 2: // HSV (smooth hue cycle)
      if (iteration >= u_max_iterations) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        float log_zn = 0.5 * log(x*x + y*y);
        float log_p  = log(float(u_p));
        float nu     = log(log_zn / log_p) / log_p;
        float mu     = float(iteration) + 1.0 - nu;

        float hue = fract(mu * 0.05);
        color = vec4(hsv2rgb(vec3(hue, 1.0, 1.0)), 1.0);
      }
      break;
    case 3: // LCH (perceptually uniform hue cycle)
      if (iteration >= u_max_iterations) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        float log_zn = 0.5 * log(x*x + y*y);
        float log_p  = log(float(u_p));
        float nu     = log(log_zn / log_p) / log_p;
        float mu     = float(iteration) + 1.0 - nu;

        float hue = fract(mu * 0.05) * 360.0;
        color = vec4(lch2rgb(vec3(70.0, 60.0, hue)), 1.0);
      }
      break;
    default:
      color = iteration < u_max_iterations ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(1.0);
      break;
  }

  return color;
}

void main(void)
{
  /*
  // Window-relative pixel to Argand-coords
  vec4 coords = vec4(2.0*gl_FragCoord.x/u_resolution.x - 1.0, 2.0*gl_FragCoord.y/u_resolution.y - 1.0, 0.0, 1.0);
  // Scale by display ratio to maintain 1:1 opengl to argand mapping
  coords = vec4(coords.x * (u_resolution.x / u_resolution.y), coords.yzw);
  // Apply zoom
  coords = vec4(coords.x / u_zoom, coords.y / u_zoom, coords.zw);
  // Offset coords
  coords = vec4(coords.x - u_offset.x * (u_resolution.x / u_resolution.y) / u_zoom, coords.y - u_offset.y / u_zoom, coords.zw);
  */

  // PIXEL to OPENGL
  vec4 coords = vec4(2.0f * gl_FragCoord.x / u_resolution.x - 1.0f, 2.0f * gl_FragCoord.y / u_resolution.y - 1.0f, 0.0f, 1.0f);

  // PIXEL to COMPLEX
  coords = vec4((u_resolution.x / u_resolution.y) * (coords.x - u_offset.x) / u_zoom, (coords.y - u_offset.y) / u_zoom, 0.0f, 1.0f);
  // INPUT to COMPLEX
  vec2 point = vec2((u_resolution.x / u_resolution.y) * (u_input.x - u_offset.x) / u_zoom, (u_input.y - u_offset.y) / u_zoom);

  float x, y, x0, y0;

  switch (u_view)
  {
    case 0:
      // Set Mandelbrot parameters
      // c
      x0 = coords.x;
      y0 = coords.y;

      // z_0
      if (u_experimental == 1)
      {
        x = point.x;
        y = point.y;
      }
      else
      {
        x = 0.0;
        y = 0.0;
      }
      break;

    case 1:
      // Set Julia parameters
      // z_0
      x0 = point.x;
      y0 = point.y;

      // c
      x = coords.x;
      y = coords.y;
      break;
    default:
      break;
    }

  outputColor = escape_time(x, y, x0, y0);
}
