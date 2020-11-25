import interact from 'interactjs';

import { Drawboard } from '../drawboard/Drawboard/index';
import { DomEventAware } from '../renderer/DomEventAware/index';
import { uuid } from '../utils/uuid';

import './index.css';
import { dragToolbarItem } from './toolbar-items';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarItem } from './ToolbarItem';

export type MouseHandler = (ev: MouseEvent) => void;

export class Toolbar extends DomEventAware {
  id: string = uuid();
  zIndex = 999;

  toolbarItems: ToolbarItem[];
  toolbarUI: HTMLElement;
  toolbarButtons: ToolbarButton[] = [];

  get toolbarButtonMap(): Record<string, ToolbarButton> {
    const buttonMap = {};

    this.toolbarButtons.forEach(b => {
      buttonMap[b.id] = b;
    });

    return buttonMap;
  }

  clickHandler: (ev: MouseEvent, toolbarItem: ToolbarItem) => void;

  constructor(
    toolbarItems: ToolbarItem[],
    clickHandler: (ev: MouseEvent, toolbarItem: ToolbarItem) => void,
  ) {
    super();

    this.toolbarItems = [dragToolbarItem, ...toolbarItems];
    this.clickHandler = clickHandler;
  }

  /** 获取 UI 元素 */
  public getUI = (drawboard: Drawboard): HTMLElement => {
    this.toolbarUI = document.createElement('div');
    this.toolbarUI.id = `fcw-toolbar-${this.id}`;
    this.toolbarUI.className = 'fc-whiteboard-toolbar';

    for (const toolbarItem of this.toolbarItems) {
      const toolbarButton = new ToolbarButton(toolbarItem, this.clickHandler);
      toolbarButton.drawboard = drawboard;
      this.toolbarUI.appendChild(toolbarButton.getElement());
      this.toolbarButtons.push(toolbarButton);
    }

    super.init(this.toolbarUI);

    (interact as any)('#drag-handler').draggable({
      onmove: this.onDragMove,
    });

    return this.toolbarUI;
  };

  public hide() {
    this.toolbarUI.style.visibility = 'hidden';
    this.toolbarUI.style.zIndex = '-1';
  }

  public show() {
    this.toolbarUI.style.visibility = 'visible';
    this.toolbarUI.style.zIndex = `${this.zIndex}`;
  }

  protected onMouseDown = (downEv: MouseEvent) => {};

  protected onMouseUp = (ev: MouseEvent) => {};

  protected onMouseMove = (ev: MouseEvent) => {};

  protected onDragMove = (event: any) => {
    const target = this.toolbarUI;

    // keep the dragged position in the data-x/data-y attributes
    const x = ((parseFloat(target.getAttribute('data-x') as string) || 0) +
      event.dx) as any;
    const y = ((parseFloat(target.getAttribute('data-y') as string) || 0) +
      event.dy) as any;

    // translate the element
    target.style.webkitTransform = target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    target.style.zIndex = `${this.zIndex}`;

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  };
}
