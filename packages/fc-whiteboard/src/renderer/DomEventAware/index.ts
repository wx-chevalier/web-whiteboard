export abstract class DomEventAware {
  x: number = 0;
  y: number = 0;
  previousMouseX: number = 0;
  previousMouseY: number = 0;

  protected init(ele: Element) {
    ele.addEventListener('mousedown', this.onMouseDown);
    ele.addEventListener('mouseup', this.onMouseUp);
    ele.addEventListener('mousemove', this.onMouseMove);

    ele.addEventListener('touchstart', this.onTouch, { passive: false });
    ele.addEventListener('touchend', this.onTouch, { passive: false });
    ele.addEventListener('touchmove', this.onTouch, { passive: false });
  }

  /** 截获 Touch 事件，并且转发为 Mouse 事件 */
  protected onTouch(ev: TouchEvent) {
    ev.preventDefault();
    const newEvt = document.createEvent('MouseEvents');
    const touch = ev.changedTouches[0];
    let type = null;

    switch (ev.type) {
      case 'touchstart':
        type = 'mousedown';
        break;
      case 'touchmove':
        type = 'mousemove';
        break;
      case 'touchend':
        type = 'mouseup';
        break;
      default:
        break;
    }

    newEvt.initMouseEvent(
      type!,
      true,
      true,
      window,
      0,
      touch.screenX,
      touch.screenY,
      touch.clientX,
      touch.clientY,
      ev.ctrlKey,
      ev.altKey,
      ev.shiftKey,
      ev.metaKey,
      0,
      null
    );

    ev.target!.dispatchEvent(newEvt);
  }

  protected abstract onMouseDown(ev: MouseEvent): void;
  protected abstract onMouseUp(ev: MouseEvent): void;
  protected abstract onMouseMove(ev: MouseEvent): void;
}
