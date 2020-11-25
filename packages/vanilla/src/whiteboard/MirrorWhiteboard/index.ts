import { SyncEvent } from '../../event/SyncEvent';
import { createDivWithClassName } from '../../utils/dom';
import { AbstractWhiteboard } from '../AbstractWhiteboard/index';
import { Mode } from '../../utils/types';

const prefix = 'fcw-board';

export class MirrorWhiteboard extends AbstractWhiteboard {
  mode: Mode = 'mirror';

  /** 初始化操作 */
  protected init() {
    // 为 target 添加子 imgs 容器
    this.imgsContainer = createDivWithClassName(`${prefix}-imgs`, this.target);
    // 为 target 添加子 pages 容器
    this.pagesContainer = createDivWithClassName(`${prefix}-pages`, this.target);

    if (!this.eventHub) {
      throw new Error('Invalid eventHub');
    }

    this.eventHub.on('sync', (ev: SyncEvent) => {
      if (ev.target !== 'whiteboard' || !ev.border) {
        return;
      }

      if (ev.event === 'borderSnap') {
        this.applySnap(ev.border);
      }

      if (ev.event === 'borderChangePage' && ev.id === this.id) {
        if (this.isInitialized) {
          this.onPageChange(ev.border.visiblePageIndex);
        }
      }

      if (ev.event === 'finish' && ev.id === this.id) {
        this.destroy();
      }
    });
  }

  public destroy() {
    super.destroy();
  }

  /** 响应页面切换的事件 */
  onPageChange(nextPageIndex: number) {
    if (this.visiblePageIndex === nextPageIndex) {
      return;
    }

    this.siema.goTo(nextPageIndex);
    this.visiblePageIndex = nextPageIndex;

    // 将所有的 Page 隐藏
    this.pages.forEach((page, i) => {
      if (nextPageIndex === i) {
        page.show();
      } else {
        page.hide();
      }
    });

    this.emit({
      event: 'borderChangePage',
      id: this.id,
      target: 'whiteboard',
      border: this.captureSnap()
    });
  }
}
