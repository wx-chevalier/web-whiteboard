import * as uuid from 'uuid/v1';

import { Drawboard } from '../../drawboard/Drawboard/index';
import { EventType, onSyncFunc } from '../../event/SyncEvent';
import { DomEventAware } from '../../renderer/DomEventAware/index';
import { SvgHelper } from '../../renderer/SvgHelper';
import { PositionType } from '../../utils/layout';
import { isNil } from '../../utils/types';
import { MarkerSnap } from '../../whiteboard/AbstractWhiteboard/snap';
import { WhitePage } from '../../whiteboard/WhitePage/index';
import { MarkerType } from '../types';

export class BaseMarker extends DomEventAware {
  id: string = uuid();
  type: MarkerType = 'base';
  // 归属的 WhitePage
  page?: WhitePage;
  // 归属的 Drawboard
  drawboard?: Drawboard;
  // Marker 的属性发生变化后的回调
  onChange: onSyncFunc = () => {};

  public static createMarker = (page?: WhitePage): BaseMarker => {
    const marker = new BaseMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  public visual: SVGGElement;
  public renderVisual: SVGGElement;

  public onSelected: (marker: BaseMarker) => void;

  public defs: SVGElement[] = [];

  width = 200;
  height = 50;

  isActive = true;
  isDragging = false;
  isResizing = false;

  public reactToManipulation(
    type: EventType,
    { dx, dy, pos }: { dx?: number; dy?: number; pos?: PositionType } = {},
  ) {
    if (type === 'moveMarker') {
      if (isNil(dx) || isNil(dy)) {
        return;
      }

      this.move(dx!, dy!);
    }

    if (type === 'resizeMarker') {
      if (isNil(dx) || isNil(dy)) {
        return;
      }

      this.resizeByEvent(dx!, dy!, pos);
    }
  }

  /** 响应元素视图状态变化 */
  public manipulate = (ev: MouseEvent) => {
    const scale = this.visual.getScreenCTM()!.a;
    const dx = (ev.screenX - this.previousMouseX) / scale;
    const dy = (ev.screenY - this.previousMouseY) / scale;

    // 如果在拖拽
    if (this.isDragging) {
      this.move(dx, dy);
    }

    // 如果是缩放
    if (this.isResizing) {
      this.resize(dx, dy, (pos: PositionType) => {
        this.onChange({
          target: 'marker',
          id: this.id,
          event: 'resizeMarker',
          marker: { dx, dy, pos },
        });
      });
    }

    this.previousMouseX = ev.screenX;
    this.previousMouseY = ev.screenY;
  };

  public endManipulation() {
    this.isDragging = false;
    this.isResizing = false;
  }

  public select() {
    this.isActive = true;
    if (this.onSelected) {
      this.onSelected(this);
    }
    return;
  }

  public deselect() {
    this.isActive = false;
    this.endManipulation();
    return;
  }

  /** 生成某个快照 */
  public captureSnap(): MarkerSnap {
    return {
      id: this.id,
      type: this.type,
      isActive: this.isActive,
      x: this.x,
      y: this.y,
    };
  }

  /** 应用某个快照 */
  public applySnap(snap: MarkerSnap): void {
    this.id = snap.id;
    this.type = snap.type;

    if (snap.x && snap.y) {
      // 移动当前位置
      this.moveTo(snap.x, snap.y);
    }

    // 判断是否为激活
    if (this.isActive) {
      this.select();
    }
  }

  /** 移除该 Marker */
  public destroy() {
    this.visual.style.display = 'none';
  }

  protected resize(x: number, y: number, cb?: Function) {
    return;
  }
  protected resizeByEvent(x: number, y: number, pos?: PositionType) {
    return;
  }

  public move = (dx: number, dy: number) => {
    const translate = this.visual.transform.baseVal.getItem(0);
    translate.setMatrix(translate.matrix.translate(dx, dy));
    this.visual.transform.baseVal.replaceItem(translate, 0);

    this.x += dx;
    this.y += dy;

    this.onChange({
      target: 'marker',
      id: this.id,
      event: 'moveMarker',
      marker: { dx, dy },
    });
  };

  /** Move to relative position */
  public moveTo = (x: number, y: number) => {
    const translate = this.visual.transform.baseVal.getItem(0);
    translate.setMatrix(translate.matrix.translate(x - this.x, y - this.y));
    this.visual.transform.baseVal.replaceItem(translate, 0);

    this.x = x;
    this.y = y;
  };

  /** Init base marker */
  protected init() {
    this.visual = SvgHelper.createGroup();
    // translate
    this.visual.transform.baseVal.appendItem(SvgHelper.createTransform());

    super.init(this.visual);
    this.renderVisual = SvgHelper.createGroup([['class', 'render-visual']]);
    this.visual.appendChild(this.renderVisual);
  }

  protected addToVisual = (el: SVGElement) => {
    this.visual.appendChild(el);
  };

  protected addToRenderVisual = (el: SVGElement) => {
    this.renderVisual.appendChild(el);
  };

  protected onMouseDown = (ev: MouseEvent) => {
    ev.stopPropagation();

    if (this.page && this.page.mode === 'mirror') {
      return;
    }

    this.select();
    this.isDragging = true;
    this.previousMouseX = ev.screenX;
    this.previousMouseY = ev.screenY;
  };

  protected onMouseUp = (ev: MouseEvent) => {
    ev.stopPropagation();
    this.endManipulation();
  };

  protected onMouseMove = (ev: MouseEvent) => {
    ev.stopPropagation();
    this.manipulate(ev);
  };
}
