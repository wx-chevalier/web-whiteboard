import { Source, Mode } from './../../utils/types';
import { Drawboard } from './../../drawboard/Drawboard/index';
import { TextMarker } from '../../markers/TextMarker/index';
import { SyncEvent } from '../../event/SyncEvent';
import { uuid } from '../../utils/uuid';
import { getMarkerByType } from '../../markers/types';
import { createDivWithClassName } from '../../utils/dom';
import { WhitepageSnap } from '../AbstractWhiteboard/snap';
import { AbstractWhiteboard } from '../AbstractWhiteboard/index';

import './index.less';
import { ToolbarItem } from '../../toolbar/ToolbarItem';

const prefix = 'fcw-page';

/** 白板中的每一页 */
export class WhitePage {
  id: string = uuid();

  source: Source;
  target: HTMLImageElement;

  /** UI Options */
  container: HTMLDivElement;
  // 父容器指针
  parentContainer?: HTMLDivElement;
  mode: Mode = 'master';

  /** Handlers */
  drawboard: Drawboard;
  whiteboard?: AbstractWhiteboard;
  mountContainer: HTMLElement;

  constructor(
    source: Source,
    {
      mode,
      whiteboard,
      parentContainer,
      extraToolbarItems
    }: Partial<WhitePage> & {
      extraToolbarItems?: ToolbarItem[];
    } = {}
  ) {
    if (mode) {
      this.mode = mode;
    }
    this.parentContainer = parentContainer;
    this.whiteboard = whiteboard;

    this.initSource(source);

    if (this.mode === 'master') {
      this.initMaster(extraToolbarItems);
    }

    if (this.mode === 'mirror') {
      this.initMirror();
    }

    if (whiteboard) {
      this.mountContainer =
        whiteboard.drawboardMountPoint === 'body' ? document.body : this.whiteboard!.target;
    }
  }

  /** LifeCycle open - destroy */
  public open() {
    this.drawboard.open();
  }

  public hide() {
    this.drawboard.hide();
  }

  public show() {
    this.drawboard.show();
  }

  public destroy() {
    this.drawboard.destroy();
  }

  /** 生成快照 */
  public captureSnap(): WhitepageSnap {
    const markerSnaps = this.drawboard.markers.map(m => m.captureSnap());

    return {
      id: this.id,
      markers: markerSnaps
    };
  }

  /** 应用快照 */
  public applySnap(snap: WhitepageSnap) {
    const markerIdsSet = new Set();

    snap.markers.forEach(markerSnap => {
      // 判断是否存在，存在则同步，否则创建
      const marker = this.drawboard.markerMap[markerSnap.id];

      markerIdsSet.add(markerSnap.id);

      // 如果存在则直接应用，否则创建新的 Marker
      if (marker) {
        marker.applySnap(markerSnap);
      } else {
        const newMarker = this.drawboard.addMarker(getMarkerByType(markerSnap.type), {
          id: markerSnap.id
        });
        newMarker.applySnap(markerSnap);
      }
    });

    // 移除当前不存在的 Marker
    this.drawboard.markers.forEach(marker => {
      if (!markerIdsSet.has(marker.id)) {
        // 如果不存在该 Marker，则删除
        this.drawboard.deleteMarkerWithEvent(marker);
      }
    });
  }

  /** 初始化源 */
  private initSource(source: Source) {
    // 判断 Source 的类型是否符合要求
    if (typeof source.imgSrc === 'string' && !this.parentContainer) {
      throw new Error('Invalid source, If you set image url, you must also set parentContainer');
    }

    this.source = source;

    // 如果传入的 imgEle，则直接使用
    if (source.imgEle) {
      this.target = source.imgEle!;
    }

    // 如果是图片，则需要创建 Image 元素
    if (typeof source.imgSrc === 'string') {
      this.container = createDivWithClassName(prefix, this.parentContainer!);
      this.container.id = this.id;

      this.target = document.createElement('img');
      this.target.src = source.imgSrc;
      this.target.alt = 'Siema image';

      this.container.appendChild(this.target);
    }
  }

  /** 以 Master 模式启动 */
  protected initMaster(extraToolbarItems?: ToolbarItem[]) {
    if (this.whiteboard) {
      // 对于 WhitePage 中加载的 Drawboard，必须是传入自身可控的 Image 元素
      this.drawboard = new Drawboard(
        { imgEle: this.target },
        {
          extraToolbarItems,
          mountContainer: this.mountContainer,
          page: this,
          onChange: ev => this.whiteboard!.emit(ev)
        }
      );
    } else {
      this.drawboard = new Drawboard(
        { imgEle: this.target },
        { page: this, mountContainer: this.mountContainer }
      );
    }
  }

  /** 以 Mirror 模式启动 */
  protected initMirror() {
    if (!this.whiteboard) {
      throw new Error('Invalid whiteboard');
    }

    this.drawboard = new Drawboard(
      { imgEle: this.target },
      { page: this, mountContainer: this.mountContainer }
    );

    this.whiteboard!.eventHub!.on('sync', (ev: SyncEvent) => {
      try {
        // 判断是否为 WhitePage 的同步
        if (ev.target === 'page' && ev.id === this.id) {
          this.onPageSync();
        }

        // 处理 Marker 的同步事件
        if (ev.target === 'marker') {
          this.onMarkerSync(ev);
        }
      } catch (e) {
        console.warn(e);
      }
    });
  }

  /** 处理 Page 的同步事件 */
  private onPageSync() {}

  /** 处理 Marker 的同步事件 */
  private onMarkerSync(ev: SyncEvent) {
    if (!ev.marker) {
      return;
    }

    const id = ev.id;

    if (ev.event === 'addMarker' && ev.parentId === this.id) {
      const marker = this.drawboard.markerMap[id!];
      if (!marker) {
        this.drawboard.addMarker(getMarkerByType(ev.marker.type!), {
          id: ev.marker.id,
          originX: ev.marker.dx,
          originY: ev.marker.dy
        });
      }
    }

    // 其余的情况，不存在 id 则直接返回空
    if (!id) {
      return;
    }

    if (ev.event === 'removeMarker') {
      const marker = this.drawboard.markerMap[id];
      if (marker) {
        this.drawboard.deleteMarker(marker);
      }
    }

    if (ev.event === 'moveMarker' || ev.event === 'resizeMarker') {
      const marker = this.drawboard.markerMap[id];

      if (marker) {
        marker.reactToManipulation(ev.event, ev.marker);
      }
    }

    // 响应文本变化事件
    if (ev.event === 'inputMarker') {
      const marker = this.drawboard.markerMap[id] as TextMarker;
      if (marker) {
        marker.setText(ev.marker.text!);
      }
    }
  }
}
