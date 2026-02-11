import Set from './set'

type MapState = {
  view: {
    main: Set,
    mini: Set,
  },
  fidelity: number,
  point: {
    re: number,
    im: number,
  },
  dynamic: boolean,
}

export default MapState;
