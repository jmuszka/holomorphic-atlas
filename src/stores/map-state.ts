import { Set } from "../types/set";
import { ColoringAlgorithm } from "../types/coloring-algorithm";
import { Point } from "../utils/position";

export type MapState = {
  view: {
    main: Set;
    mini: Set;
  };
  mousePosition: Point;
  canvasOffset: Point;
  zoom: number;
  dynamic: boolean;
  iterations: number;
  experimental: boolean;
  coloringAlgorithm: ColoringAlgorithm;
};

export const defaultState: MapState = {
  view: {
    main: Set.Mandelbrot,
    mini: Set.Julia,
  },
  mousePosition: new Point({
    x: window.innerWidth / 2.0,
    y: window.innerHeight / 2.0,
  }),
  canvasOffset: new Point({
    x: window.innerWidth / 2.0,
    y: window.innerHeight / 2.0,
  }),
  zoom: 1.0,
  dynamic: false,
  iterations: 500,
  experimental: true,
  coloringAlgorithm: ColoringAlgorithm.Continuous,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isValidState = (state: any): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isObject = (val: any) => val !== null && typeof val === "object";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isNumber = (val: any) => typeof val === "number";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isBoolean = (val: any) => typeof val === "boolean";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isSet = (val: any) => Object.values(Set).includes(val);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isColoringAlgorithm = (val: any) =>
      Object.values(ColoringAlgorithm).includes(val);

    return (
      isObject(state) &&
      isObject(state.view) &&
      isSet(state.view.main) &&
      isSet(state.view.mini) &&
      isObject(state.mousePosition) &&
      isNumber(state.mousePosition.x) &&
      isNumber(state.mousePosition.y) &&
      isObject(state.canvasOffset) &&
      isNumber(state.canvasOffset.x) &&
      isNumber(state.canvasOffset.y) &&
      isNumber(state.zoom) &&
      state.zoom > 0 &&
      isBoolean(state.dynamic) &&
      isNumber(state.iterations) &&
      state.iterations > 0 &&
      isBoolean(state.experimental) &&
      isColoringAlgorithm(state.coloringAlgorithm)
    );
  } catch {
    return false;
  }
};

export const loadURLState = (): MapState => {
  const url = new URL(window.location.href);
  const encodedState = url.searchParams.get("state");

  if (!encodedState) {
    return defaultState;
  }

  try {
    const decodedState = JSON.parse(atob(encodedState));

    if (!isValidState(decodedState)) {
      console.warn("Invalid state in URL, falling back to default");
      url.searchParams.delete("state");
      window.history.replaceState(null, "", url.toString());
      return defaultState;
    }

    if (decodedState.sourceViewport) {
      // Use height as the reference to maintain the vertical scale (imaginary axis)
      // This prevents "warping" because the fractal's aspect ratio is handled
      // by the window's aspect ratio in toComplex.
      const scale = window.innerHeight / decodedState.sourceViewport.height;

      // Adjust positions uniformly to keep the fractal's features at the same
      // relative size, then center the change for the X axis.
      decodedState.mousePosition.x *= scale;
      decodedState.mousePosition.y *= scale;
      decodedState.canvasOffset.x *= scale;
      decodedState.canvasOffset.y *= scale;

      // Offset X to account for the difference in width after scaling
      const widthDiff =
        (window.innerWidth - decodedState.sourceViewport.width * scale) / 2;
      decodedState.mousePosition.x += widthDiff;
      decodedState.canvasOffset.x += widthDiff;

      delete decodedState.sourceViewport;
    }

    decodedState.mousePosition = new Point(decodedState.mousePosition);
    decodedState.canvasOffset = new Point(decodedState.canvasOffset);

    return decodedState as MapState;
  } catch (e) {
    console.error(
      "Failed to decode state from URL, falling back to default",
      e,
    );
    url.searchParams.delete("state");
    window.history.replaceState(null, "", url.toString());
    return defaultState;
  }
};

export const updateURLState = (state: MapState | null) => {
  const url = new URL(window.location.href);

  if (!state) {
    url.searchParams.delete("state");
    window.history.replaceState(null, "", url.toString());
    return;
  }

  const dataToEncode = {
    view: state.view,
    mousePosition: state.mousePosition,
    canvasOffset: state.canvasOffset,
    zoom: state.zoom,
    dynamic: state.dynamic,
    iterations: state.iterations,
    experimental: state.experimental,
    coloringAlgorithm: state.coloringAlgorithm,
    sourceViewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };

  try {
    const encodedState = btoa(JSON.stringify(dataToEncode));
    url.searchParams.set("state", encodedState);
    window.history.replaceState(null, "", url.toString());
  } catch (e) {
    console.error("Failed to encode state:", e);
  }
};
