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
  const encodedState = new URL(window.location.href).searchParams.get("state");
  const url = new URL(window.location.href);

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
  const encodedState = btoa(JSON.stringify(state || {}));

  const url = new URL(window.location.href);
  if (state) url.searchParams.set("state", encodedState);
  else url.searchParams.delete("state");

  window.history.replaceState(null, "", url.toString());
};
