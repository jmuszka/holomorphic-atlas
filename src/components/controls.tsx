const Controls = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold border-b border-gray-400/50 pb-3 text-white">
        Holomorphic Atlas
      </h2>
      <div className="text-base leading-relaxed text-gray-100">
        Explore the infinite complexity of fractal geometry through the
        Mandelbrot and Julia sets.
      </div>
      <div className="bg-gray-600/30 p-6 rounded-lg text-sm space-y-3 text-gray-200">
        <p>
          • <b className="text-white">Left-click</b> to toggle dynamic
          rendering.
        </p>
        <p>
          • <b className="text-white">Right-click</b> to swap between Mandelbrot
          and Julia views.
        </p>
        <p>
          • <b className="text-white">Scroll</b> to zoom in and out.
        </p>
        <p>
          • <b className="text-white">Drag</b> to pan across the set.
        </p>
      </div>
    </div>
  );
};

export default Controls;
