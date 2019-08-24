import { MirrorWhiteboard } from '../MirrorWhiteboard';
import { SyncEvent } from '../../event/SyncEvent';
import { EventHub } from '../../event/EventHub';

// 窗口大小为一分钟
const windowSize = 60 * 1000;
const duration = 0.05;

/** 根据某个时间点，获取一系列的 Event，获取的是绝对时间；这里的 startTime 和 endTime 都是当初记录时候关联的绝对时间 */
export type onLoadFunc = (startTime: number, endTime: number) => Promise<SyncEvent[]>;

export class ReplayWhiteboard extends MirrorWhiteboard {
  leftEvents: SyncEvent[] = [];

  // 记录开始时间
  recordStartTime: number;
  // 当前的相对时间
  currentRelativeTime: number = 0;
  loadedRelativeTime: number = -1;

  // Inner Handler
  interval: any;
  loadingLock: boolean = false;
  seekingLock: boolean = false;
  onLoad: onLoadFunc;

  /** Getter & Setter */
  /** 设置录播相关的上下文信息 */
  setContext(recordStartTime: number, onLoad: onLoadFunc) {
    this.recordStartTime = recordStartTime;
    this.onLoad = onLoad;

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.seek();
    }, duration * 1000);
  }

  setCurrentRelativeTime(time: number) {
    this.currentRelativeTime = time;
    this.loadedRelativeTime = this.currentRelativeTime - 1;
  }

  /** 扩展父类的关闭函数 */
  close() {
    super.close();

    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  protected init() {
    this.eventHub = new EventHub();

    super.init();
  }

  /** 加载全部的事件 */
  private loadEvents() {
    if (this.onLoad && !this.loadingLock) {
      this.loadingLock = true;

      const startTime = this.recordStartTime + this.currentRelativeTime;
      const endTime = startTime + windowSize;

      this.onLoad(startTime, endTime)
        .then(events => {
          this.loadedRelativeTime = this.currentRelativeTime;
          this.leftEvents.push(...(events || []));
        })
        .finally(() => {
          this.loadingLock = false;
        });
    }
  }

  /** 回调，定期更新时间，执行操作 */
  private seek = () => {
    if (this.seekingLock) {
      return;
    }
    this.seekingLock = true;
    // 如果已经进入到了加载完毕的状态，则
    if (this.loadedRelativeTime < this.currentRelativeTime) {
      this.loadEvents();
    }

    // 获取需要回放的 Events，即所有小于当前时间点的 Events

    const waitingEvents: SyncEvent[] = [];
    const leftEvents: SyncEvent[] = [];

    this.leftEvents.forEach((e, i) => {
      if (e.timestamp && e.timestamp < this.currentRelativeTime + this.recordStartTime) {
        waitingEvents.push(e);
      } else {
        leftEvents.push(e);
      }
    });

    this.leftEvents = leftEvents;

    waitingEvents.forEach(e => {
      this.perform(e);
    });

    this.currentRelativeTime += duration;
    this.seekingLock = false;
  };

  /** 执行事件回放操作 */
  private perform = (e: SyncEvent) => {
    this.eventHub!.emit('sync', e);
  };
}
