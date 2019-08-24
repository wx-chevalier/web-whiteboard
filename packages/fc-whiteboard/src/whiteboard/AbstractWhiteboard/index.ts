import { Mode } from './../../utils/types';
import { SyncEvent } from '../../event/SyncEvent';

import { WhitePage } from '../WhitePage/index';
import { EventHub } from '../../event/EventHub';
import { uuid } from '../../utils/uuid';
import { addClassName } from '../../utils/dom';

import './index.less';
import { WhiteboardSnap } from '../AbstractWhiteboard/snap';
import * as Siema from 'siema';

const prefix = 'fcw-board';

export abstract class AbstractWhiteboard {
  id: string = uuid();
  sources: string[] = [];

  /** 元素 */
  // 如果传入的是图片地址，则需要挂载到该 Target 元素下
  target: HTMLDivElement;
  imgEles: HTMLDivElement[] = [];
  imgsContainer: HTMLDivElement;
  pagesContainer: HTMLDivElement;

  /** Options */
  // 是否仅同步快照数据，用于弱网状态下
  allowRollback: boolean = false;
  // 是否开启自动比例适配
  autoFit: boolean = false;
  onlyEmitSnap: boolean = false;
  // 画板的挂载点
  drawboardMountPoint: 'body' | 'parent' = 'body';
  snapInterval: number = 15 * 1000;

  /** UI Options */
  // 事件中心
  eventHub?: EventHub;
  // 编辑模式
  mode: Mode = 'master';
  // 是否为全屏模式
  isFullscreen: boolean = false;

  /** 句柄 */
  pages: WhitePage[] = [];
  get activePage() {
    return this.pages[this.visiblePageIndex];
  }
  get pageMap(): Record<string, WhitePage> {
    const map = {};
    this.pages.forEach(p => (map[p.id] = p));

    return map;
  }
  siema: any;
  // 历史快照记录
  snapHistory: WhiteboardSnap[] = [];

  /** State | 内部状态 */
  // 是否被初始化过，如果尚未被初始化，则等待来自于 Master 的同步消息
  isInitialized: boolean = false;
  isSyncing: boolean = false;
  visiblePageIndex: number = 0;
  emitInterval: any;

  constructor(
    target: HTMLDivElement,
    {
      sources,
      eventHub,
      visiblePageIndex,
      allowRollback,
      onlyEmitSnap,
      drawboardMountPoint
    }: Partial<AbstractWhiteboard> = {}
  ) {
    if (target) {
      this.target = target;
    } else {
      this.target = document.createElement('div');
      document.body.appendChild(this.target);
    }

    if (!this.target.id) {
      this.target.id = this.id;
    }

    addClassName(this.target, prefix);

    if (sources) {
      this.sources = sources;
    }

    this.eventHub = eventHub;

    // set inner state
    if (typeof visiblePageIndex !== 'undefined') {
      this.visiblePageIndex = visiblePageIndex;
    }

    this.onlyEmitSnap = !!onlyEmitSnap;

    if (typeof allowRollback !== 'undefined') {
      this.allowRollback = !!allowRollback;
    }

    if (drawboardMountPoint) {
      this.drawboardMountPoint = drawboardMountPoint;
    }

    this.init();
  }

  /** LifeCycle */
  public open() {
    // 依次渲染所有的页，隐藏非当前页之外的其他页
    this.pages.forEach((page, i) => {
      page.open();

      if (i !== this.visiblePageIndex) {
        page.hide();
      }
    });
  }

  /** 关闭当前的 Whiteboard */
  public close() {
    if (this.emitInterval) {
      clearInterval(this.emitInterval);
    }
  }

  /** 展示当前的 WhitePage */
  public show() {
    if (this.activePage) {
      this.activePage.show();
    }
  }

  public hide() {
    if (this.activePage) {
      this.activePage.hide();
    }
  }

  /** 触发事件 */
  public emit(borderEvent: SyncEvent) {
    if (this.mode !== 'master' || !this.eventHub) {
      return;
    }

    // 在快照模式下，仅同步快照消息
    if (this.onlyEmitSnap) {
      if (borderEvent.event !== 'borderSnap') {
        return;
      }
    }

    // 判断是否进行了元素的增加或者删除，如果开启了则添加历史记录
    if (
      this.allowRollback &&
      (borderEvent.event === 'addMarker' || borderEvent.event === 'removeMarker')
    ) {
      if (this.snapHistory.length > 20) {
        this.snapHistory.shift();
      }

      this.snapHistory.push(this.captureSnap(false));
    }

    borderEvent.timestamp = Math.floor(Date.now() / 1000);
    this.eventHub.emit('sync', borderEvent);
  }

  /** 获取当前快照 */
  public captureSnap(shadow: boolean = true): WhiteboardSnap {
    if (shadow) {
      return {
        id: this.id,
        sources: this.sources,
        pageIds: this.pages.map(page => page.id),
        visiblePageIndex: this.visiblePageIndex
      };
    }

    return {
      id: this.id,
      sources: this.sources,
      pageIds: this.pages.map(page => page.id),
      visiblePageIndex: this.visiblePageIndex,
      pages: this.pages.map(p => p.captureSnap())
    };
  }

  /** 回退到上一个 Snap */
  public rollbackSnap() {
    // 始终保留空白的 Snap
    if (this.snapHistory.length === 0 || this.snapHistory.length === 1) {
      return;
    }

    this.snapHistory.pop();
    const snap = this.snapHistory[this.snapHistory.length - 1];

    if (snap) {
      this.applySnap(snap);
    }
  }

  /** 销毁操作操作 */
  public destroy(): void {
    if (this.emitInterval) {
      clearInterval(this.emitInterval);
    }

    if (this.eventHub) {
      this.eventHub.removeAllListeners();
    }

    if (this.siema) {
      this.siema.destroy();
    }

    this.imgsContainer.remove();
    this.pagesContainer.remove();

    this.pages.forEach(page => {
      page.destroy();
    });
  }

  /** 初始化操作 */
  protected abstract init(): void;

  /** 初始化 Siema */
  protected initSiema() {
    // 初始化所有的占位图片，用于给 Siema 播放使用
    this.sources.forEach(source => {
      const imgEle = document.createElement('div');
      addClassName(imgEle, `${prefix}-img-wrapper`);
      imgEle.style.backgroundImage = `url(${source})`;

      this.imgEles.push(imgEle);
      this.imgsContainer.appendChild(imgEle);
    });

    // 初始化 Siema，并且添加控制节点
    this.siema = new Siema({
      selector: this.imgsContainer,
      duration: 200,
      easing: 'ease-out',
      perPage: 1,
      startIndex: 0,
      draggable: false,
      multipleDrag: true,
      threshold: 20,
      loop: false,
      rtl: false
    });
  }

  protected abstract onPageChange(nextPageIndex: number): void;

  /** 响应获取到的快照事件 */
  protected applySnap(snap: WhiteboardSnap) {
    const { id, sources, pageIds } = snap;

    if (!this.isInitialized && !this.isSyncing) {
      this.id = id;
      this.sources = sources;
      this.isSyncing = true;

      // 初始化所有的 WhitePages
      this.sources.forEach((source, i) => {
        const page = new WhitePage(
          { imgSrc: source },
          {
            mode: this.mode,
            whiteboard: this,
            parentContainer: this.pagesContainer
          }
        );
        page.id = pageIds[i];

        // 这里隐藏 Dashboard 的图片源，Siema 切换的是占位图片
        page.container.style.visibility = 'hidden';

        this.pages.push(page);

        page.open();
      });

      this.initSiema();
      this.isInitialized = true;
      this.isSyncing = false;
    }

    // 如果已经初始化完毕，则进行状态同步
    this.onPageChange(snap.visiblePageIndex);

    // 同步 Pages
    (snap.pages || []).forEach(pageSnap => {
      const page = this.pageMap[pageSnap.id];

      if (page) {
        page.applySnap(pageSnap);
      }
    });
  }
}
