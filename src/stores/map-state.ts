import { Set } from "../types/set";
import { MousePosition } from "../utils/mouse";

export type MapState = {
  view: {
    main: Set;
    mini: Set;
  };
  fidelity: number;
  position: MousePosition;
  dynamic: boolean;
};

export const defaultState: MapState = {
  view: {
    main: Set.MANDELBROT,
    mini: Set.JULIA,
  },
  fidelity: 1.0,
  position: new MousePosition(
    window.innerWidth / 2.0,
    window.innerHeight / 2.0,
  ),
  dynamic: false,
};

export const loadURLState = (): MapState => {
  const encodedState = new URL(window.location.href).searchParams.get("state");

  if (!encodedState) {
    return defaultState;
  }

  const decodedState = JSON.parse(atob(encodedState));

  // TODO: validation

  return decodedState;
};

export const updateURLState = (state: MapState | null) => {
  const encodedState = btoa(JSON.stringify(state || {}));

  const url = new URL(window.location.href);
  if (state) url.searchParams.set("state", encodedState);
  else url.searchParams.delete("state");

  window.history.replaceState(null, "", url.toString());
};
