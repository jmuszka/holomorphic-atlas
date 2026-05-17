import { useEffect, useRef } from "react";
import { useInfoMenu } from "./info-menu-context";

const HoloAtlas = () => {
  const { currentIndex } = useInfoMenu();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  return (
    <div
      ref={scrollRef}
      className="space-y-6 overflow-auto px-8 py-2 h-full scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:rounded-full scrollbar-gutter-stable"
    >
      <h1 className="text-3xl font-bold border-b border-gray-400/50 pb-3 text-white">
        About the HoloAtlas
      </h1>
      <p>
        Use the <b>holomorphic atlas</b> to explore the mesmerizing patterns and
        recursive beauty of complex analysis's most well-known computer
        visualizations, the <b>Mandelbrot set</b> and its complementary{" "}
        <b>Julia sets</b>.
      </p>

      <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
        Controls
      </h2>
      <div className="bg-gray-500/30 p-6 rounded-lg text-sm space-y-3 text-gray-200">
        <li>
          <b>Scroll</b> to zoom into the set's infinite fractal depth.
        </li>
        <li>
          <b>Left-click</b> to toggle dynamic rendering and change the initial
          conditions based on your mouse coordinates, visualizing the varying
          shapes of each set.
        </li>
        <li>
          <b>Right-click</b> to toggle between viewing the Mandelbrot set and
          its corresponding Julia set.
        </li>
        <li>
          <b>Drag the map</b> to pan around and explore different regions.
        </li>
        <li>
          Interact with the control panel to adjust the parameters of the
          rendering algorithms, toggle experimental mode and accessible touch
          controls for navigation, save/reset the state of the atlas, or
          download an image of the current view.
        </li>
      </div>

      <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
        About
      </h2>
      <p>
        I created this digital atlas to express my intersecting interests in
        mathematics, graphics programming, software development, and digital
        cartography.
      </p>
      <p>
        One of the reasons I love making educational tools is not purely for the
        pedagogical purpose of imparting knowledge onto others, but also as a
        medium to share my passions and to gain a more rigorous understanding of
        the topics I find intrinsically fascinating.
      </p>
      <p>
        Creating HoloAtlas served as an excellent vessel to strengthen my
        proficiency in complex analysis while honing my ability to leverage the
        computer graphics pipeline through OpenGL. I would encourage anyone
        interested in complex analysis or (inclusive) low-level graphics
        programming to render your own Mandelbrot set as a rite of passage of
        sorts.
      </p>
    </div>
  );
};

export default HoloAtlas;
