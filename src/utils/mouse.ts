export class Position {
  private x: number;
  private y: number;

  constructor(pos: { x: number; y: number }) {
    this.x = pos.x;
    this.y = pos.y;
  }

  getPosition(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y,
    };
  }

  toOpenGl(): { x: number; y: number } {
    return {
      x: (2 * this.x - window.innerWidth) / window.innerWidth,
      y: (window.innerHeight - 2 * this.y) / window.innerHeight,
    };
  }

  toArgand(): { re: number; im: number } {
    const openGl = this.toOpenGl();
    return {
      re: 2.0 * openGl.x,
      im: openGl.y,
    };
  }
}
