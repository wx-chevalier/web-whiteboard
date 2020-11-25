import tippy from 'tippy.js';

import { Drawboard } from '../drawboard/Drawboard';
import { uuid } from '../utils/uuid';

import { ToolbarItem } from './ToolbarItem';

/** 工作栏按钮 */
export class ToolbarButton {
  id = uuid();
  drawboard: Drawboard;
  toolbarItem: ToolbarItem;
  container: HTMLDivElement;

  clickHandler: (ev: MouseEvent, toolbarItem: ToolbarItem) => void;

  constructor(
    toolbarItem: ToolbarItem,
    clickHandler?: (ev: MouseEvent, toolbarItem: ToolbarItem) => void
  ) {
    this.toolbarItem = toolbarItem;

    if (clickHandler) {
      this.clickHandler = clickHandler;
    }
  }

  public getElement = (): HTMLElement => {
    if (this.toolbarItem.onRender) {
      this.container = this.toolbarItem.onRender().cloneNode(true) as HTMLDivElement;
      return this.container;
    }

    const div = document.createElement('div');

    if (this.toolbarItem.name !== 'separator') {
      div.className = 'fc-whiteboard-toolbar-button';

      if (this.clickHandler) {
        div.addEventListener('click', (ev: MouseEvent) => {
          if (this.clickHandler) {
            this.clickHandler(ev, this.toolbarItem);
          }
        });
      }

      if (this.toolbarItem.icon) {
        div.title = this.toolbarItem.tooltipText || '';
        div.innerHTML = this.toolbarItem.icon;
      } else {
        div.innerText = this.toolbarItem.tooltipText || '';
      }

      if (this.toolbarItem.tooltipText) {
        tippy(div, {
          content: this.toolbarItem.shortcut
            ? `${this.toolbarItem.tooltipText} ${this.toolbarItem.shortcut}`
            : this.toolbarItem.tooltipText
        });
      }
    } else {
      div.className = 'fc-whiteboard-toolbar-separator';
    }

    div.id = `fc-whiteboard-toolbar-${this.toolbarItem.name}`;

    this.container = div;

    return div;
  };
}
