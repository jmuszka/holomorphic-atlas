import { useEffect, useRef } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useInfoMenu } from "./info-menu-context";

const Implementation = () => {
  const { currentIndex } = useInfoMenu();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  return (
    <MathJaxContext>
      <div
        ref={scrollRef}
        className="space-y-6 overflow-auto px-8 py-2 h-full scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:rounded-full scrollbar-gutter-stable"
      >
        <h1 className="text-3xl font-bold border-b border-gray-400/50 pb-3 text-white">
          Implementation
        </h1>
        <p>
          HoloAtlas renders fractals entirely on the GPU using WebGL2 fragment
          shaders. Every pixel is computed in parallel — the CPU's only role is
          to supply uniforms and, in one coloring mode, read back pixel data to
          build a histogram.
        </p>

        {/* ── Escape Time ─────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
          The Escape Time Algorithm
        </h2>
        <p>
          Each fragment shader invocation handles one screen pixel. It maps the
          pixel's position to a point in the complex plane and runs the
          recurrence relation
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[z_{n+1} = z_n^p + c\\]`}</MathJax>
        </div>
        <p>
          until either the orbit escapes — meaning{" "}
          <MathJax inline>{`\\(|z_n|^2 > p^2\\)`}</MathJax> — or the iteration
          counter reaches the user-supplied maximum. The escape condition{" "}
          <MathJax inline>{`\\(|z_n| > p\\)`}</MathJax> is the standard bailout
          radius for degree-<MathJax inline>{`\\(p\\)`}</MathJax> maps; using
          the same value for both the exponent and the bailout is a convenient
          coincidence of the multibrot family that keeps the parameter space
          clean.
        </p>
        <p>
          The exponent <MathJax inline>{`\\(p\\)`}</MathJax> generalises the
          classic Mandelbrot set (<MathJax inline>{`\\(p=2\\)`}</MathJax>) to
          the broader <em>multibrot</em> family. Because{" "}
          <MathJax inline>{`\\(z^p\\)`}</MathJax> is computed iteratively rather
          than with <code>pow</code>, the inner loop runs{" "}
          <MathJax inline>{`\\(p-1\\)`}</MathJax> multiplications per iteration:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[z^p = \\underbrace{z \\cdot z \\cdots z}_{p}\\]`}</MathJax>
        </div>
        <p>
          The pixel whose orbit takes <MathJax inline>{`\\(n\\)`}</MathJax>{" "}
          steps to escape carries that count to the coloring stage. Pixels that
          never escape are considered members of the set and rendered black.
        </p>
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-400/30 text-sm italic text-blue-100">
          Because each pixel's orbit is independent, the fragment shader runs
          the entire loop for every pixel simultaneously across thousands of GPU
          cores; what would take seconds on a single CPU thread completes in
          milliseconds.
        </div>

        {/* ── Coordinate Transform ────────────────────────────────────── */}
        <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
          Coordinate Transform
        </h2>
        <p>
          WebGL's built-in coordinate{" "}
          <MathJax inline>{`\\(gl\\_FragCoord\\)`}</MathJax> runs from{" "}
          <MathJax inline>{`\\((0,0)\\)`}</MathJax> at the bottom-left to{" "}
          <MathJax inline>{`\\((W,H)\\)`}</MathJax> at the top-right. The shader
          maps this to the complex plane in two steps:
        </p>
        <p>
          <b>Step 1: Pixel to OpenGL normalized device coordinates</b>
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[x_{\\text{ndc}} = \\frac{2x_{\\text{px}}}{W} - 1, \\quad y_{\\text{ndc}} = \\frac{2y_{\\text{px}}}{H} - 1\\]`}</MathJax>
        </div>
        <p>
          <b>Step 2 — NDC to complex plane</b>, applying the aspect ratio, zoom,
          and pan offset:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[\\text{Re}(c) = \\frac{W}{H} \\cdot \\frac{x_{\\text{ndc}} - x_{\\text{off}}}{z}, \\quad \\text{Im}(c) = \\frac{y_{\\text{ndc}} - y_{\\text{off}}}{z}\\]`}</MathJax>
        </div>
        <p>
          The aspect ratio factor <MathJax inline>{`\\(W/H\\)`}</MathJax> keeps
          the imaginary axis fixed regardless of window shape. Pan and zoom are
          uploaded each frame as uniforms and applied identically to both the
          main and minimap canvases, which share the same shader program but
          swap the roles of <MathJax inline>{`\\(c\\)`}</MathJax> and{" "}
          <MathJax inline>{`\\(z_0\\)`}</MathJax> to display the Julia set.
        </p>

        {/* ── Coloring ─────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
          Coloring Algorithms
        </h2>
        <p>
          The raw escape count <MathJax inline>{`\\(n\\)`}</MathJax> is an
          integer, which produces harsh visible rings — every pixel that escaped
          at exactly the same step gets the same color. Each algorithm below
          addresses this differently.
        </p>

        <h3 className="text-xl font-bold text-white">Continuous</h3>
        <p>
          The smooth escape count adds a fractional correction derived from how
          far past the bailout radius the orbit actually travelled:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[\\mu = n + 1 - \\frac{\\log\\!\\left(\\log|z_n|\\,/\\,\\log p\\right)}{\\log p}\\]`}</MathJax>
        </div>
        <p>
          When <MathJax inline>{`\\(|z_n|\\)`}</MathJax> barely clears the
          bailout, the correction term is near zero and{" "}
          <MathJax inline>{`\\(\\mu \\approx n+1\\)`}</MathJax>. When the orbit
          overshoots dramatically, the term grows and{" "}
          <MathJax inline>{`\\(\\mu\\)`}</MathJax> slides back toward{" "}
          <MathJax inline>{`\\(n\\)`}</MathJax>. The result is a continuous
          float that blends seamlessly between adjacent integer bands.{" "}
          <MathJax inline>{`\\(\\mu\\)`}</MathJax> is then passed through a
          parameterized palette:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[\\text{RGB} = \\varphi\\!\\left(t + \\vec{d}\\right), \\quad t = \\{\\mu \\cdot s\\}\\]`}</MathJax>
        </div>
        <p>
          where <MathJax inline>{`\\(\\{\\cdot\\}\\)`}</MathJax> denotes the
          fractional part and three parameters control the visual output:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <MathJax inline>{`\\(s\\)`}</MathJax> — band density; higher values
            pack more color cycles into the same iteration range.
          </li>
          <li>
            <MathJax inline>{`\\(\\varphi : [0,1] \\to [0,1]^3\\)`}</MathJax> —
            the interpolation function applied per channel. Currently cosine,{" "}
            <MathJax
              inline
            >{`\\(\\varphi(x) = \\tfrac{1}{2} + \\tfrac{1}{2}\\cos(2\\pi x)\\)`}</MathJax>
            , but any periodic function yields a valid palette — linear
            sawtooth, smoothstep, triangle, and others each produce distinct
            aesthetics.
          </li>
          <li>
            <MathJax inline>{`\\(\\vec{d} \\in [0,1]^3\\)`}</MathJax> —
            per-channel phase offsets. The default{" "}
            <MathJax inline>{`\\((0,\\,0.33,\\,0.67)\\)`}</MathJax> spaces the
            R, G, B peaks evenly around the cycle for a full-spectrum result;
            shifting these values produces different hue balances and tints.
          </li>
        </ul>
        <p>
          All three parameters are planned to be user-configurable, making the
          palette fully customizable without changing the underlying smooth
          count formula.
        </p>

        <h3 className="text-xl font-bold text-white">Histogram Equalization</h3>
        <p>
          Even with smooth coloring, most escaped pixels cluster at low
          iteration counts near the set boundary, so much of the palette is
          wasted on a thin fringe. Histogram equalization redistributes colors
          so that each band covers equal screen area.
        </p>
        <p>
          This requires two GPU passes. In pass one, the fragment shader outputs
          packed iteration counts rather than colors — the low and high bytes of{" "}
          <MathJax inline>{`\\(n\\)`}</MathJax> are stored in the R and G
          channels of an offscreen RGBA texture:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[R = n \\bmod 256, \\quad G = \\lfloor n / 256 \\rfloor\\]`}</MathJax>
        </div>
        <p>
          The CPU reads back this texture, builds a histogram{" "}
          <MathJax inline>{`\\(h[n]\\)`}</MathJax>, and computes the cumulative
          distribution:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[t[n] = \\frac{1}{N_{\\text{escaped}}}\\sum_{k=0}^{n} h[k]\\]`}</MathJax>
        </div>
        <p>
          This CDF array is uploaded as a single-row floating-point texture (a
          look-up table). In pass two, each pixel samples the look-up table at
          its iteration index to get the equalized color position{" "}
          <MathJax inline>{`\\(t \\in [0,1]\\)`}</MathJax>, which is then passed
          through the same parameterized palette{" "}
          <MathJax inline>{`\\(\\varphi(t + \\vec{d})\\)`}</MathJax> described
          above — so the density, interpolation function, and phase offsets
          apply uniformly across all palette-based algorithms.
        </p>
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-400/30 text-sm italic text-blue-100">
          The two-pass design requires care to avoid a WebGL feedback loop: the
          iteration count texture must not be bound to any sampler unit while it
          is simultaneously the framebuffer render target, or the draw call is
          silently discarded.
        </div>

        <h3 className="text-xl font-bold text-white">HSV</h3>
        <p>
          HSV maps the smooth count <MathJax inline>{`\\(\\mu\\)`}</MathJax>{" "}
          directly to hue, leaving saturation and value fixed at 1:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[H = \\{\\mu \\cdot s\\}, \\quad S = 1, \\quad V = 1\\]`}</MathJax>
        </div>
        <p>
          The full spectrum appears in order (red → yellow → green → cyan → blue
          → magenta) and repeats with period{" "}
          <MathJax inline>{`\\(1/s\\)`}</MathJax> iterations, where{" "}
          <MathJax inline>{`\\(s\\)`}</MathJax> is the same user-configurable
          density parameter shared with the palette-based algorithms. The
          standard compact HSV → RGB conversion is used:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[p_i = \\left|\\{H + d_i\\} \\cdot 6 - 3\\right| - 1, \\quad \\text{RGB} = V \\cdot \\text{mix}(1,\\, \\text{clamp}(p_i, 0, 1),\\, S)\\]`}</MathJax>
        </div>
        <p>
          where <MathJax inline>{`\\(d = (0,\\, 2/3,\\, 1/3)\\)`}</MathJax>{" "}
          shifts each channel to the correct phase of the hue hexagon.
        </p>

        <h3 className="text-xl font-bold text-white">LCH</h3>
        <p>
          HSV's weakness is perceptual non-uniformity: yellow at full saturation
          appears far brighter than blue. LCH (Lightness, Chroma, Hue) is the
          cylindrical form of the CIELAB color space, designed so that equal
          numerical distances correspond to equal perceived color differences.
          By fixing <MathJax inline>{`\\(L\\)`}</MathJax> and{" "}
          <MathJax inline>{`\\(C\\)`}</MathJax> and cycling only{" "}
          <MathJax inline>{`\\(H\\)`}</MathJax>, every band appears equally
          bright and vivid.
        </p>
        <p>
          The conversion chain from LCH to display-ready sRGB traverses four
          spaces:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[\\text{LCH} \\xrightarrow{\\text{polar}} \\text{LAB} \\xrightarrow{f^{-1}} \\text{XYZ} \\xrightarrow{M} \\text{linear sRGB} \\xrightarrow{\\gamma} \\text{sRGB}\\]`}</MathJax>
        </div>
        <p>
          The LAB → XYZ step inverts the perceptual cube-root transfer function:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[f^{-1}(t) = \\begin{cases} t^3 & t > \\tfrac{6}{29} \\\\ 3\\left(\\tfrac{6}{29}\\right)^2\\!\\left(t - \\tfrac{4}{29}\\right) & \\text{otherwise} \\end{cases}\\]`}</MathJax>
        </div>
        <p>
          and the XYZ → linear sRGB step applies the standard{" "}
          <MathJax inline>{`\\(3 \\times 3\\)`}</MathJax> Bradford-adapted
          matrix for the D65 white point. The final sRGB gamma curve is:
        </p>
        <div className="py-2 scale-110">
          <MathJax>{`\\[C_{\\text{out}} = \\begin{cases} 12.92\\,C & C \\leq 0.0031308 \\\\ 1.055\\,C^{1/2.4} - 0.055 & \\text{otherwise} \\end{cases}\\]`}</MathJax>
        </div>
        <p>
          Colors that fall outside the sRGB gamut (most common at high chroma in
          the cyan–green region) are clamped before the gamma step rather than
          wrapping, which preserves luminance at the cost of slightly reducing
          saturation near those hues.
        </p>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-400/20 text-sm text-slate-300 mt-4">
          The coloring algorithms described and implemented here were heavily
          inspired by the Wikipedia article{" "}
          <a
            href="https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set#LCH_coloring"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            Plotting algorithms for the Mandelbrot set
          </a>
          .
        </div>
      </div>
    </MathJaxContext>
  );
};

export default Implementation;
