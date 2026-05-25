export class Point {
  private x: number;
  private y: number;

  constructor(pos: { x: number; y: number }) {
    this.x = pos.x;
    this.y = pos.y;
  }

  raw(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y,
    };
  }

  openGl(): { x: number; y: number } {
    return {
      x: (2 * this.x - window.innerWidth) / window.innerWidth,
      y: (window.innerHeight - 2 * this.y) / window.innerHeight,
    };
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export const toComplex = (
  mousePosition: Point,
  canvasOffset: Point,
  zoom: number,
): { re: number; im: number } => {
  return {
    re:
      ((window.innerWidth / window.innerHeight) *
        (mousePosition.openGl().x - canvasOffset.openGl().x)) /
      zoom,
    im: (mousePosition.openGl().y - canvasOffset.openGl().y) / zoom,
  };
};
