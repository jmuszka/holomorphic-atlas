import { Set } from "../types/set";

export type MapState = {
  view: {
    main: Set;
    mini: Set;
  };
  fidelity: number;
  point: {
    re: number;
    im: number;
  };
  dynamic: boolean;
};

export const defaultState: MapState = {
  view: {
    main: Set.MANDELBROT,
    mini: Set.JULIA,
  },
  fidelity: 1.0,
  point: {
    re: 0.0,
    im: 0.0,
  },
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
