import { HotkeysListener, KEY_ALL } from 'fc-hotkeys';
import * as debounce from 'lodash.debounce';

import { onSyncFunc } from '../../event/SyncEvent';
import { ArrowMarker } from '../../markers/ArrowMarker/index';
import { CoverMarker } from '../../markers/CoverMarker/index';
import { HighlightMarker } from '../../markers/HighlightMarker/index';
import { LineMarker } from '../../markers/LineMarker/index';
import { RectMarker } from '../../markers/RectMarker/index';
import { TextMarker } from '../../markers/TextMarker/index';
import { Synthetizer } from '../../renderer/Synthetizer';
import { Toolbar } from '../../toolbar/Toolbar';
import { ToolbarItem } from '../../toolbar/ToolbarItem';
import { rectContains } from '../../utils/layout';
import { WhitePage } from '../../whiteboard/WhitePage';

import { BaseMarker } from './../../markers/BaseMarker/index';
import { getToolbars } from './../../toolbar/toolbar-items';
import { Source } from './../../utils/types';
import { Baseboard } from './../Baseboard/index';
import './index.css';

export class Drawboard extends Baseboard {
  /** Options */
  mountContainer = document.body;
  scale = 1.0;
  zIndex = 999;
  allowKeyboard? = true;

  /** 句柄 */
  page: WhitePage;
  listener: HotkeysListener;

  markers: BaseMarker[];
  get markerMap(): { [key: string]: BaseMarker } {
    const map = {};
    this.markers.forEach(marker => {
      map[marker.id] = marker;
    });
    return map;
  }
  activeMarker: BaseMarker | null;

  toolbarItems: ToolbarItem[];

  toolbar: Toolbar;
  toolbarUI: HTMLElement;

  /** 回调 */
  onComplete: (dataUrl: string) => void = () => {};
  onChange: onSyncFunc = () => {};
  onCancel: () => void;

  constructor(
    source: Source,
    {
      allowKeyboard = true,
      extraToolbarItems,
      mountContainer,
      page,
      zIndex,
      onChange,
    }: Partial<Drawboard> & { extraToolbarItems?: ToolbarItem[] } = {},
  ) {
    super(source);

    if (page) {
      this.page = page;
    }

    if (zIndex) {
      this.zIndex = zIndex;
    }

    this.allowKeyboard = allowKeyboard;

    this.markers = [];
    this.activeMarker = null;

    const toolbarItems = getToolbars(page);

    if (extraToolbarItems) {
      toolbarItems.push(...extraToolbarItems);
    }

    this.toolbarItems = toolbarItems;

    if (onChange) {
      this.onChange = onChange;
    }

    if (allowKeyboard && this.page && this.page.mode === 'master') {
      this.listener = new HotkeysListener();
      this.listener.on(KEY_ALL, debounce(this.onKeyboard, 150));
    }

    if (mountContainer) {
      this.mountContainer = mountContainer;
    }
  }

  /** @region LifeCycle open - hide - show - ... - close */
  /** 打开画板 */
  public open = (
    onComplete?: (dataUrl: string) => void,
    onCancel?: () => void,
  ) => {
    if (onComplete) {
      this.onComplete = onComplete;
    }

    if (onCancel) {
      this.onCancel = onCancel;
    }

    this.setTargetRect();

    this.initBoard(this.mountContainer);
    this.attachEvents();
    this.setStyles();

    window.addEventListener('resize', this.adjustUI);

    if ((this.page && this.page.mode === 'master') || !this.page) {
      this.showUI();
    }
  };

  public hide = () => {
    if (this.source.imgSrc) {
      this.target.style.display = 'none';
    }
    // 这里不使用 display:none，是为了保证在隐藏时候仍然可以执行更新
    this.boardHolder.style.visibility = 'hidden';
    this.boardHolder.style.zIndex = '-1';

    if (this.toolbar) {
      this.toolbar.hide();
    }
  };

  public show = () => {
    if (this.source.imgSrc) {
      this.target.style.display = 'block';
    }

    this.boardHolder.style.visibility = 'visible';
    this.boardHolder.style.zIndex = `${this.zIndex}`;

    if (this.toolbar) {
      this.toolbar.show();
    }
  };

  public destroy = () => {
    if (this.toolbarUI && this.toolbarUI.parentElement) {
      this.toolbarUI.parentElement.removeChild(this.toolbarUI);
    }

    if (this.boardHolder && this.boardHolder.parentElement) {
      this.boardHolder.parentElement.removeChild(this.boardHolder);
    }

    if (this.listener) {
      this.listener.reset();
    }
  };

  public render = (
    onComplete: (dataUrl: string) => void,
    onCancel?: () => void,
  ) => {
    this.onComplete = onComplete;

    if (onCancel) {
      this.onCancel = onCancel;
    }

    this.selectMarker(null);
    this.startRender(this.renderFinished);
  };

  /** 添加某个 Marker */
  public addMarker = (
    markerType: typeof BaseMarker,
    {
      id,
      originX,
      originY,
    }: { id?: string; originX?: number; originY?: number } = {},
  ) => {
    // 假如 Drawboard 存在 Page 引用，则传导给 Marker
    const marker = markerType.createMarker(this.page);

    if (id) {
      marker.id = id;
    }

    marker.drawboard = this;
    marker.onSelected = this.selectMarker;
    marker.onChange = this.onChange;

    if (marker.defs && marker.defs.length > 0) {
      for (const d of marker.defs) {
        if (d.id && !this.boardCanvas.getElementById(d.id)) {
          this.defs.appendChild(d);
        }
      }
    }

    this.markers.push(marker);
    this.selectMarker(marker);
    this.boardCanvas.appendChild(marker.visual);

    let x;
    let y;

    if (originX && originY) {
      x = originX;
      y = originY;
    } else {
      // 默认居中
      const bbox = marker.visual.getBBox();
      x = this.width / 2 / this.scale - bbox.width / 2;
      y = this.height / 2 / this.scale - bbox.height / 2;
    }

    // 触发事件流
    this.onChange({
      target: 'marker',
      parentId: this.page ? this.page.id : this.id,
      event: 'addMarker',
      marker: { type: marker.type, id: marker.id, dx: x, dy: y },
    });

    marker.moveTo(x, y);

    return marker;
  };

  public deleteActiveMarker = () => {
    this.deleteMarkerWithEvent(this.activeMarker);
  };

  public clearMarkers = () => {
    [...this.markers].forEach(marker => {
      this.deleteMarkerWithEvent(marker);
    });
  };

  public deleteMarkerWithEvent = (marker: BaseMarker | null) => {
    if (marker) {
      // 触发事件
      if (this.onChange) {
        this.onChange({
          event: 'removeMarker',
          id: marker.id,
          target: 'marker',
          marker: { id: marker.id },
        });
      }
      this.deleteMarker(marker);
    }
  };

  private setTargetRect = () => {
    const targetRect = this.target.getBoundingClientRect() as DOMRect;
    const bodyRect = document.body.parentElement!.getBoundingClientRect();

    this.targetRect = {
      left: targetRect.left - bodyRect.left,
      top: targetRect.top - bodyRect.top,
    } as ClientRect;
  };

  private startRender = (done: (dataUrl: string) => void) => {
    const renderer = new Synthetizer();
    renderer.rasterize(this.target, this.boardCanvas, done);
  };

  private attachEvents = () => {
    this.boardCanvas.addEventListener('mousedown', this.mouseDown);
    this.boardCanvas.addEventListener('mousemove', this.mouseMove);
    this.boardCanvas.addEventListener('mouseup', this.mouseUp);
  };

  private mouseDown = (ev: MouseEvent) => {
    /* tslint:disable:no-bitwise */
    if (this.activeMarker && (ev.buttons & 1) > 0) {
      this.activeMarker.deselect();
      this.activeMarker = null;
    }
  };

  private mouseMove = (ev: MouseEvent) => {
    /* tslint:disable:no-bitwise */
    if (this.activeMarker && (ev.buttons & 1) > 0) {
      this.activeMarker.manipulate(ev);
    }
  };

  private mouseUp = (ev: MouseEvent) => {
    if (this.activeMarker) {
      this.activeMarker.endManipulation();
    }
  };

  private onKeyboard = (e: any, { hotkey }: { hotkey: string }) => {
    switch (hotkey) {
      case 'Shift+R':
        this.addMarker(RectMarker);
        return;
      case 'Shift+H':
        this.addMarker(HighlightMarker);
        return;
      case 'Shift+C':
        this.addMarker(CoverMarker);
        return;
      case 'Shift+L':
        this.addMarker(LineMarker);
        return;
      case 'Shift+A':
        this.addMarker(ArrowMarker);
        return;
      case 'Shift+T':
        this.addMarker(TextMarker);
        return;
      case 'ESC':
        this.page.whiteboard!.rollbackSnap();
        return;
      default:
        break;
    }
    if (!this.activeMarker) {
      return;
    }

    switch (hotkey) {
      case 'UP':
        this.activeMarker.move(0, -10);
        return;
      case 'LEFT':
        this.activeMarker.move(-10, 0);
        return;
      case 'RIGHT':
        this.activeMarker.move(10, 0);
        return;
      case 'DOWN':
        this.activeMarker.move(0, 10);
        return;
      case 'BACKSPACE':
        this.deleteActiveMarker();
        return;
      default:
        return;
    }
  };

  private adjustUI = (ev: UIEvent) => {
    this.adjustSize();
    this.positionUI();
  };

  private adjustSize = () => {
    this.width = this.target.clientWidth;
    this.height = this.target.clientHeight;

    const scale = this.target.clientWidth / this.boardHolder.clientWidth;
    if (scale !== 1.0) {
      this.scale *= scale;
      this.boardHolder.style.width = `${this.width}px`;
      this.boardHolder.style.height = `${this.height}px`;

      this.boardHolder.style.transform = `scale(${this.scale})`;
    }
  };

  private positionUI = () => {
    this.setTargetRect();
    this.positionBoard();
    this.positionToolbar();
  };

  private positionToolbar = () => {
    if (this.toolbarUI && this.targetRect) {
      this.toolbarUI.style.left = `${
        this.targetRect.left +
        this.target.offsetWidth -
        this.toolbarUI.clientWidth
      }px`;
      this.toolbarUI.style.top = `${
        this.targetRect.top - this.toolbarUI.clientHeight
      }px`;
    }
  };

  private showUI = () => {
    this.toolbar = new Toolbar(this.toolbarItems, this.toolbarClick);
    this.toolbar.zIndex = this.zIndex + 1;

    this.toolbarUI = this.toolbar.getUI(this);

    this.boardHolder.appendChild(this.toolbarUI);
    this.toolbarUI.style.position = 'absolute';

    this.positionToolbar();
    this.toolbar.show();

    // 处理元素的拖拽事件
    this.toolbar.toolbarButtons.forEach(button => {
      if (button.toolbarItem.draggable) {
        button.container.draggable = true;
        button.container.ondragstart = ev => {
          if (ev) {
            ev.dataTransfer!.setData('id', button.id);
          }
        };
      }
    });

    this.boardCanvas.ondragover = ev => {
      ev.preventDefault();
    };

    this.boardCanvas.ondrop = ev => {
      const markerX = ev.x;
      const markerY = ev.y;

      const rect = this.boardHolder.getBoundingClientRect();

      if (rectContains(rect, { x: markerX, y: markerY })) {
        const buttonId = ev.dataTransfer!.getData('id');

        const button = this.toolbar.toolbarButtonMap[buttonId];

        if (button.toolbarItem && button.toolbarItem.markerType) {
          this.addMarker(button.toolbarItem.markerType, {
            originX: markerX - rect.left,
            originY: markerY - rect.top,
          });
        }
      }
    };
  };

  private setStyles = () => {
    const editorStyleSheet = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style',
    );
    editorStyleSheet.innerHTML = `
            .rect-marker .render-visual {
                stroke: #ff0000;
                stroke-width: 3;
                fill: transparent;
            }
            .cover-marker .render-visual {
                stroke-width: 0;
                fill: #000000;
            }
            .highlight-marker .render-visual {
                stroke: transparent;
                stroke-width: 0;
                fill: #ffff00;
                fill-opacity: 0.4;
            }
            .line-marker .render-visual {
                stroke: #ff0000;
                stroke-width: 3;
                fill: transparent;
            }
            .arrow-marker .render-visual {
                stroke: #ff0000;
                stroke-width: 3;
                fill: transparent;
            }
            .arrow-marker-tip {
                stroke-width: 0;
                fill: #ff0000;
            }
            .text-marker text {
                fill: #ff0000;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                    Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
                    "Segoe UI Emoji", "Segoe UI Symbol";
            }
            .fc-whiteboard-rect-control-box .fc-whiteboard-rect-control-rect {
                stroke: black;
                stroke-width: 1;
                stroke-opacity: 0.5;
                stroke-dasharray: 3, 2;
                fill: transparent;
            }
            .fc-whiteboard-control-grip {
                fill: #cccccc;
                stroke: #333333;
                stroke-width: 2;
            }
        `;

    this.boardCanvas.appendChild(editorStyleSheet);
  };

  /** 处理 Toolbar 的点击事件 */
  private toolbarClick = (ev: MouseEvent, toolbarItem: ToolbarItem) => {
    if (toolbarItem.onClick) {
      toolbarItem.onClick();
    } else if (toolbarItem.markerType) {
      this.addMarker(toolbarItem.markerType);
    } else {
      // command button
      switch (toolbarItem.name) {
        case 'delete': {
          // 判断是否存在 Active Marker，不存在则提示
          if (!this.activeMarker) {
            alert('Please select marker first!');
            return;
          }
          this.deleteActiveMarker();
          break;
        }
        case 'pointer': {
          if (this.activeMarker) {
            this.selectMarker(null);
          }
          break;
        }
        case 'close': {
          this.cancel();
          break;
        }
        case 'ok': {
          this.complete();
          break;
        }
        default:
          break;
      }
    }
  };

  private selectMarker = (marker: BaseMarker | null) => {
    if (this.activeMarker && this.activeMarker !== marker) {
      this.activeMarker.deselect();
    }
    this.activeMarker = marker;
  };

  public deleteMarker = (marker: BaseMarker) => {
    this.boardCanvas.removeChild(marker.visual);
    if (this.activeMarker === marker) {
      this.activeMarker = null;
    }
    this.markers.splice(this.markers.indexOf(marker), 1);
  };

  private complete = () => {
    this.selectMarker(null);
    this.startRender(this.renderFinishedClose);
  };

  private cancel = () => {
    this.destroy();
    if (this.onCancel) {
      this.onCancel();
    }
  };

  private renderFinished = (dataUrl: string) => {
    this.onComplete(dataUrl);
  };

  private renderFinishedClose = (dataUrl: string) => {
    this.destroy();
    this.onComplete(dataUrl);
  };
}
