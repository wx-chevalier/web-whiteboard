import { BaseMarker } from './../markers/BaseMarker/index';

/** 对于工具栏的定义 */
export class ToolbarItem {
  name: string;
  tooltipText?: string;
  shortcut?: string;
  icon?: string;
  markerType?: typeof BaseMarker;
  onRender?: () => HTMLDivElement;
  onClick?: () => void;

  draggable?: boolean;

  constructor({
    name,
    tooltipText,
    shortcut,
    icon,
    draggable,
    markerType,
    onRender,
    onClick
  }: Partial<ToolbarItem>) {
    if (!name) {
      throw new Error('Invalid params');
    }

    this.name = name;
    this.tooltipText = tooltipText;
    this.shortcut = shortcut;
    this.icon = icon;
    this.markerType = markerType;
    this.draggable = draggable;

    this.onClick = onClick;
    this.onRender = onRender;
  }
}
