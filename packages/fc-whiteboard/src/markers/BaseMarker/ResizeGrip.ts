import { SvgHelper } from '../../renderer/SvgHelper';

/** 操作小圆点 */
export class ResizeGrip {
  public visual: SVGGraphicsElement;

  public readonly GRIP_SIZE = 10;

  constructor() {
    this.visual = SvgHelper.createCircle(this.GRIP_SIZE, [['class', 'fc-whiteboard-control-grip']]);
  }
}
