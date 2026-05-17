import { useEffect, useRef } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useInfoMenu } from "./info-menu-context";

const Explanation = () => {
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
          Understanding the Sets
        </h1>
        <p>
          Here, we briefly derive the Mandelbrot and Julia sets from a simple
          complex-valued function.
        </p>

        <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
          The Mandelbrot Set
        </h2>
        <p>Let us define the following function:</p>
        <p>
          <MathJax
            inline
          >{`\\(f:\\mathbb{C}\\rightarrow\\mathbb{C}\\)`}</MathJax>
          , where <MathJax inline>{`\\(f_c(z) = z^2 + c\\)`}</MathJax>
        </p>
        <p>
          For any choice of{" "}
          <MathJax inline>{`\\(c \\in \\mathbb{C},\\,f_c(z)\\)`}</MathJax> is a
          holomorphic function, as it is complex-differentiable over any point
          in the Argand plane. A notable property of{" "}
          <MathJax inline>{`\\(f_c(z)\\)`}</MathJax> arises:
        </p>
        <p>
          When iteratively composing <MathJax inline>{`\\(f_c(z)\\)`}</MathJax>{" "}
          with itself <MathJax inline>{`\\(n\\)`}</MathJax> times (i.e.{" "}
          <MathJax inline>{`\\(f_c(f_c(...f_c(z))) \\iff f_c^n(z)\\)`}</MathJax>
          ), the choice of <MathJax inline>{`\\(c\\)`}</MathJax> determines
          whether an upper bound exists for the set of modulus values of the
          recursive sequence as <MathJax inline>{`\\(n\\)`}</MathJax> tends to
          infinity.
        </p>

        <p>
          Let us demonstrate this property with a few examples while leaving a
          rigorous proof as an exercise for the reader. We will use the
          recurrence relation{" "}
          <MathJax inline>{`\\(z_{n+1} = z_n^2 + c\\)`}</MathJax> as a more
          intuitive notation for <MathJax inline>{`\\(f_c^n(z)\\)`}</MathJax>{" "}
          and define <MathJax inline>{`\\(z_o := 0\\)`}</MathJax>.
        </p>

        <h3 className="text-xl font-bold text-white">Exercise</h3>

        <p>
          <b>Example 1:</b> Choose <MathJax inline>{`\\(c := 0\\)`}</MathJax>
        </p>
        <p>
          <MathJax
            inline
          >{`\\(z_1 = 0^2 + 0 = 0 \\implies z_2 = 0^2 + 0 = 0 \\implies ...\\)`}</MathJax>
        </p>
        <p>
          In this example it is trivial to see that the sequence converges and
          we can thus establish a supremum of{" "}
          <MathJax inline>{`\\(0\\)`}</MathJax>.
        </p>

        <p>
          <b>Example 2:</b> Choose <MathJax inline>{`\\(c := 1+i\\)`}</MathJax>
        </p>
        <p>
          <MathJax inline>{`\\(z_1 = 0^2 + 1+i = 1+i\\)`}</MathJax>
        </p>
        <p>
          <MathJax inline>{`\\(z_2 = (1+i)^2 + 1+i = 1+3i\\)`}</MathJax>
        </p>
        <p>
          <MathJax inline>{`\\(...\\)`}</MathJax>
        </p>
        <p>
          <MathJax inline>{`\\(z_5 = -9407 -193i\\)`}</MathJax>
        </p>
        <p>
          The accelerating rate of divergence is clear after just 5 iterations
          of the sequence: no upper bound exists.
        </p>

        <p>
          <b>Example 3:</b> Choose <MathJax inline>{`\\(c := -1\\)`}</MathJax>
        </p>
        <p>
          <MathJax
            inline
          >{`\\(z_1 = 0^2 - 1  = -1 \\implies z_2 = (-1)^2 -1 = 0 \\implies z_3 = 0^2 - 1 = - 1 \\implies z_4 = (-1)^2 - 1 = 0 \\implies ...\\)`}</MathJax>
        </p>
        <p>
          This choice of <MathJax inline>{`\\(c\\)`}</MathJax> immediately
          forces the sequence into a loop where each iteration oscillates
          between <MathJax inline>{`\\(0\\)`}</MathJax> and{" "}
          <MathJax inline>{`\\(-1\\)`}</MathJax> ad infinitum. While technically
          diverging, the sequence does not exceed a modulus of{" "}
          <MathJax inline>{`\\(|-1|\\)`}</MathJax>, so we can establish an upper
          bound.
        </p>

        <h3 className="text-xl font-bold text-white">
          Defining the Mandelbrot Set
        </h3>

        <p>
          The Mandelbrot set, denoted <MathJax inline>{`\\(M\\)`}</MathJax>, is
          defined as the set of all{" "}
          <MathJax inline>{`\\(c \\in \\mathbb{C}\\)`}</MathJax> that maintain
          an upper bound as the sequence{" "}
          <MathJax inline>{`\\(z_{n+1} = z_n^2+c\\)`}</MathJax>, with{" "}
          <MathJax inline>{`\\(z_0 := 0\\)`}</MathJax>, iterates to infinity
          (or, as a corollary, as <MathJax inline>{`\\(c\\)`}</MathJax> is
          infinitely squared).
        </p>

        <p>
          For example, <MathJax inline>{`\\(0,\\,-1 \\in M\\)`}</MathJax>, but{" "}
          <MathJax inline>{`\\(1+i \\notin M\\)`}</MathJax> (see previous
          exercise). It is important to note that{" "}
          <MathJax inline>{`\\(M\\)`}</MathJax> does not strictly contain
          convergent values but also values that oscillate: consequently, not
          all divergent points lie outside the set but only ones without an
          upper bound.
        </p>

        <p>
          <MathJax inline>{`\\(M\\)`}</MathJax> is a well-connected set that
          produces chaotic oscillatory patterns near its boundary. By mapping
          these coordinates through an adequate choice of coloring function{" "}
          <MathJax inline>
            {`\\(C:\\mathbb{C} \\rightarrow [0,\\,1]^4\\)`} (complex number to
            RGBA tuple)
          </MathJax>
          , we can create stunningly intricate fractal art. In theory one could
          infinitely zoom into the edges of the fractal and discover new
          patterns with HoloAtlas were it not for the limited numerical
          resolution of digital computers.
        </p>

        <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
          Julia Sets
        </h2>

        <p>
          Recall that the Mandelbrot set consists of all values of a variable{" "}
          <MathJax inline>{`\\(c \\in \\mathbb{C}\\)`}</MathJax> such that the
          recurrence relation{" "}
          <MathJax inline>{`\\(z_{n+1} = z_n^2 + c\\)`}</MathJax>, with a fixed
          starting point <MathJax inline>{`\\(z_0\\)`}</MathJax> (
          <MathJax inline>{`\\(z_0 := 0\\)`}</MathJax> to be precise), has a
          definable upper bound.
        </p>

        <h3 className="text-xl font-bold text-white">Definition</h3>

        <p>
          Suppose we instead fix <MathJax inline>{`\\(c\\)`}</MathJax> to a
          chosen constant and assign <MathJax inline>{`\\(z_0\\)`}</MathJax> as
          the parameter. This is precisely the idea behind the Julia set, a
          logical complement to the Mandelbrot set.
        </p>

        <p>
          Julia sets, like their counterpart, are well-connected (if and only if{" "}
          <MathJax inline>{`\\(c \\in M\\)`}</MathJax>*) sets yielded from
          repeated composition of holomorphic function{" "}
          <MathJax inline>{`\\(f_c(z)\\)`}</MathJax>. They also possess
          multi-dimensional intricacies in the neighborhood of their boundaries,
          although in very distinct shapes.
        </p>
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-400/30 text-sm italic text-blue-100">
          *Points outside the Mandelbrot set produce "Cantor dust" Julia
          sets—disconnected clouds of points that never meet.
        </div>

        <p>
          Interestingly, when <MathJax inline>{`\\(c = 0\\)`}</MathJax> the
          Julia set is simply a unit circle. This is because the recurrence
          relation in this case simply reduces to{" "}
          <MathJax inline>{`\\(z_{n+1} = z_n^2\\)`}</MathJax>, and it holds that
          for <MathJax inline>{`\\(|z_0| < 1\\)`}</MathJax> the modulus tends to{" "}
          <MathJax inline>{`\\(0\\)`}</MathJax> as{" "}
          <MathJax inline>{`\\(n\\)`}</MathJax> approaches infinity and remains
          at <MathJax inline>{`\\(1\\)`}</MathJax> when{" "}
          <MathJax inline>{`\\(|z_0| = 1\\)`}</MathJax>, whereas it grows
          arbitrarily large if <MathJax inline>{`\\(|z_0| > 1\\)`}</MathJax>.
        </p>

        <h3 className="text-xl font-bold text-white">
          Mandelbrot Set as an Index
        </h3>

        <p>
          The Mandelbrot set can be thought of as a set of well-connected
          Julia-set indices, as each{" "}
          <MathJax inline>{`\\(c \\in M\\)`}</MathJax> seeds a distinct
          connected Julia set.
        </p>

        <p>
          And conversely, if one is willing to relax the{" "}
          <MathJax inline>{`\\(z_0 := 0\\)`}</MathJax> constraint of the
          Mandelbrot definition, a Julia set can function as an index of
          "generalized Mandelbrot sets."
        </p>

        <p>
          It is intractable yet inspiring to conceive of the possible fractal
          art in the hyper-dimensional Euclidian space of{" "}
          <MathJax inline>{`\\(\\mathbb{C}^2\\)`}</MathJax> by constructing a
          bijective function mapping points in each Julia set to points in each
          orthogonal, generalized Mandelbrot set.
        </p>

        <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
          A Note on Generalized Mandelbrot Sets
        </h2>

        <p>
          While not an established term in mainstream mathematical literature,
          we coined this term to describe a suite of sets constructed by
          choosing any initial <MathJax inline>{`\\(z_0\\)`}</MathJax>, not just{" "}
          <MathJax inline>{`\\(z_0 := 0\\)`}</MathJax>.
        </p>

        <p>
          HoloAtlas allows you to enable "experimental mode" to explore what the
          hypothetical notion of a generalized Mandelbrot set may look like.
          Feel free to toggle this feature at will.
        </p>
      </div>
    </MathJaxContext>
  );
};

export default Explanation;
