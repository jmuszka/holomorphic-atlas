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
        <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
          Understanding the Sets
        </h2>

        <div className="space-y-4 text-base leading-relaxed text-gray-100">
          <section>
            <h3 className="text-lg font-semibold text-white mb-2">
              The Mandelbrot Set
            </h3>
            <div className="space-y-3">
              <p>
                The Mandelbrot set is the set of complex numbers{" "}
                <MathJax inline>{`\\(c\\)`}</MathJax> for which the iterative
                function
              </p>
              <div className="py-2 scale-110">
                <MathJax>{`\\[z_{n+1} = z_n^2 + c\\]`}</MathJax>
              </div>
              <p>
                remains bounded when starting at{" "}
                <MathJax inline>{`\\(z_0 = 0\\)`}</MathJax>. It serves as a
                "map" of all possible Julia sets.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">
              Julia Sets
            </h3>
            <p>
              While the Mandelbrot set varies{" "}
              <MathJax inline>{`\\(c\\)`}</MathJax>, a Julia set is formed by
              fixing <MathJax inline>{`\\(c\\)`}</MathJax> and varying the
              starting point <MathJax inline>{`\\(z_0\\)`}</MathJax>. Every
              point in the Mandelbrot set corresponds to a unique, connected
              Julia set.
            </p>
          </section>

          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-400/30 text-sm italic text-blue-100">
            Points outside the Mandelbrot set produce "Cantor dust" Julia
            sets—disconnected clouds of points that never meet.
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
};

export default Implementation;
