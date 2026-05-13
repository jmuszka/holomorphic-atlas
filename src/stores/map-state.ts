import { Set } from "../types/set";
import { Position } from "../utils/position";

export type MapState = {
  view: {
    main: Set;
    mini: Set;
  };
  position: Position;
  offset: Position;
  zoom: number;
  dynamic: boolean;
  iterations: number;
  experimental: boolean;
};

export const defaultState: MapState = {
  view: {
    main: Set.MANDELBROT,
    mini: Set.JULIA,
  },
  position: new Position({
    x: window.innerWidth / 2.0,
    y: window.innerHeight / 2.0,
  }),
  offset: new Position({
    x: window.innerWidth / 2.0,
    y: window.innerHeight / 2.0,
  }),
  zoom: 1.0,
  dynamic: false,
  iterations: 10000,
  experimental: true,
};

export const loadURLState = (): MapState => {
  const encodedState = new URL(window.location.href).searchParams.get("state");

  if (!encodedState) {
    return defaultState;
  }

  const decodedState = JSON.parse(atob(encodedState));
  decodedState.position = new Position(decodedState.position); // necessary because typescript objects don't get encoded/decoded properly
  decodedState.offset = new Position(decodedState.offset); // necessary because typescript objects don't get encoded/decoded properly

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
