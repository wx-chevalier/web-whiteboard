import {
  BxLeftArrowSvg,
  BxRightArrowSvg,
  FinishSvg,
  RollbackSvg,
} from '../../assets/svg';
import { separatorToolbarItem } from '../../toolbar/toolbar-items';
import { createDivWithClassName } from '../../utils/dom';
import { Mode } from '../../utils/types';
import { AbstractWhiteboard } from '../AbstractWhiteboard/index';
import { WhitePage } from '../WhitePage/index';

import { ToolbarItem } from './../../toolbar/ToolbarItem';

const LeftArrowIcon = BxLeftArrowSvg;
const RightArrowIcon = BxRightArrowSvg;
const FinishIcon = FinishSvg;
const RollbackIcon = RollbackSvg;

const prefix = 'fcw-board';

export class Whiteboard extends AbstractWhiteboard {
  mode: Mode = 'master';

  /** 销毁操作 */
  public destroy() {
    super.destroy();
  }

  /** 初始化操作 */
  protected init() {
    // 为 target 添加子 imgs 容器
    this.imgsContainer = createDivWithClassName(`${prefix}-imgs`, this.target);
    // 为 target 添加子 pages 容器
    this.pagesContainer = createDivWithClassName(
      `${prefix}-pages`,
      this.target,
    );

    this.initMaster();

    // 添加初始化的 Snapshot
    this.snapHistory.push(this.captureSnap(false));

    this.emitSnapshot();
  }

  /** 以主模式启动 */
  private initMaster() {
    this.isInitialized = true;

    // 初始化控制节点
    const prevToolbarItem = {
      icon: LeftArrowIcon,
      name: 'prev-flip-arrow',
      tooltipText: 'Prev',
      onClick: () => {
        const nextPageIndex =
          this.visiblePageIndex - 1 < 0
            ? this.pages.length - 1
            : this.visiblePageIndex - 1;

        document
          .querySelectorAll('.fc-whiteboard-indicator-current')
          .forEach(e => {
            e.innerHTML = `${nextPageIndex + 1}`;
          });

        this.onPageChange(nextPageIndex);
      },
    };

    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'fc-whiteboard-indicator-container';
    const indicatorCurrent = document.createElement('span');
    indicatorCurrent.className = 'fc-whiteboard-indicator-current';
    indicatorCurrent.innerHTML = `${this.visiblePageIndex + 1}`;

    indicatorContainer.appendChild(indicatorCurrent);
    indicatorContainer.appendChild(
      document.createTextNode(`/${this.sources.length}`),
    );

    const indicatorItem: ToolbarItem = {
      name: 'indicator',
      onRender: () => indicatorContainer,
    };

    const nextToolbarItem = {
      icon: RightArrowIcon,
      name: 'next-flip-arrow',
      tooltipText: 'Next',
      onClick: () => {
        const nextPageIndex =
          this.visiblePageIndex + 1 > this.pages.length - 1
            ? 0
            : this.visiblePageIndex + 1;

        document
          .querySelectorAll('.fc-whiteboard-indicator-current')
          .forEach(e => {
            e.innerHTML = `${nextPageIndex + 1}`;
          });

        this.onPageChange(nextPageIndex);
      },
    };

    const finishItem: ToolbarItem = {
      icon: FinishIcon,
      name: 'finish',
      tooltipText: 'Finish',
      onClick: () => {
        this.emit({
          event: 'finish',
          id: this.id,
          target: 'whiteboard',
        });
      },
    };

    const rollbackItem: ToolbarItem = {
      icon: RollbackIcon,
      name: 'rollback',
      tooltipText: 'Rollback',
      shortcut: 'ESC',
      onClick: () => {
        this.rollbackSnap();
      },
    };

    // 初始化所有的 WhitePages
    this.sources.forEach(source => {
      const page = new WhitePage(
        { imgSrc: source },
        {
          mode: this.mode,
          whiteboard: this,
          parentContainer: this.pagesContainer,
          extraToolbarItems: [
            separatorToolbarItem,
            prevToolbarItem,
            indicatorItem,
            nextToolbarItem,
            separatorToolbarItem,
            finishItem,
            rollbackItem,
          ],
        },
      );

      // 这里隐藏 Dashboard 的图片源，Siema 切换的是占位图片
      page.container.style.visibility = 'hidden';

      this.pages.push(page);
    });

    this.initSiema();
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
      border: this.captureSnap(),
    });
  }

  /** 触发快照事件 */
  private emitSnapshot() {
    const innerFunc = () => {
      this.emit({
        event: 'borderSnap',
        id: this.id,
        target: 'whiteboard',
        border: this.captureSnap(false),
      });
    };

    // 定期触发事件
    this.emitInterval = setInterval(() => {
      innerFunc();
    }, this.snapInterval);

    // 首次事件，延时 500ms 发出
    setTimeout(innerFunc, 500);
  }
}
