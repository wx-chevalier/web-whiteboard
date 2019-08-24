import { Source } from './../../utils/types';
import { uuid } from './../../utils/uuid';
import { SvgHelper } from './../../renderer/SvgHelper/index';

/** 基础的绘制版 */
export class Baseboard {
  id: string = uuid();

  // 状态
  isFullscreen: boolean = false;

  /** 元素 */
  source: Source;

  // 目前使用 Image 元素作为输出源
  target: HTMLImageElement;
  targetRect: ClientRect;

  boardCanvas: SVGSVGElement;
  boardHolder: HTMLDivElement;
  defs: SVGDefsElement;

  width: number;
  height: number;

  constructor(source: Source) {
    this.source = source;

    // 如果传入的是某个元素，则直接附着
    if (source.imgEle) {
      this.target = source.imgEle!;

      this.width = this.target.clientWidth;
      this.height = this.target.clientHeight;
    }

    // 如果仅传入图片地址或者 Blob，则必须为全屏模式
  }

  protected initBoard = (mountContainer: HTMLElement) => {
    // init holder
    this.boardHolder = document.createElement('div');
    this.boardHolder.id = `fcw-board-holder-${this.id}`;
    this.boardHolder.className = `fcw-board-holder`;
    this.boardHolder.style.zIndex = '999';
    // fix for Edge's touch behavior
    this.boardHolder.style.setProperty('touch-action', 'none');
    this.boardHolder.style.setProperty('-ms-touch-action', 'none');

    mountContainer.appendChild(this.boardHolder);

    // init canvas
    this.boardCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.boardCanvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.boardCanvas.setAttribute('width', this.width.toString());
    this.boardCanvas.setAttribute('height', this.height.toString());
    this.boardCanvas.setAttribute(
      'viewBox',
      '0 0 ' + this.width.toString() + ' ' + this.height.toString()
    );

    this.boardHolder.style.position = mountContainer === document.body ? 'absolute' : 'fixed';
    this.boardHolder.style.width = `${this.width}px`;
    this.boardHolder.style.height = `${this.height}px`;
    this.boardHolder.style.transformOrigin = 'top left';
    this.positionBoard();
    this.defs = SvgHelper.createDefs();
    this.boardCanvas.style.pointerEvents = 'auto';
    this.boardCanvas.appendChild(this.defs);
    this.boardHolder.appendChild(this.boardCanvas);
  };

  /** 放置 Board */
  protected positionBoard = () => {
    this.boardHolder.style.top = this.targetRect.top + 'px';
    this.boardHolder.style.left = this.targetRect.left + 'px';
  };
}
