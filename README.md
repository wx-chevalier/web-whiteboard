![](https://i.postimg.cc/dV2QcC20/image.png)

# fc-whiteboard

Web whiteboard screencasting(both live and playback mode) with background slides, can be used as a graphics tablet for online tutoring or remote collaboration.

![](https://i.postimg.cc/pXNpNRwq/image.png)

在很多培训、协作、在线演讲的场景下，我们需要有电子白板的功能，能够方便地在演讲者与听众之间共享屏幕、绘制等信息。[fc-whiteboard https://parg.co/NiK](https://github.com/wx-chevalier/fractal-components/tree/master/fc-whiteboard) 是 Web 在线白板组件库，支持实时直播（一对多）与回放两种模式，其绘制版也能够独立使用。fc-whiteboard 内置了 EventHub，只需要像 [Mushi-Chat](https://github.com/wx-chevalier/Mushi-Chat) 这样提供简单的 WebSocket 服务端，即可快速构建实时在线共享电子白板。

# Usage | 使用

## Whiteboard live mode | 直播模式

直播模式的效果如下图所示：

![](https://i.postimg.cc/65t7MNBQ/Kapture-2019-04-17-at-13-47-52.gif)

Source code can be found in [Code Sandbox](https://codesandbox.io/s/3q1z35q53p?fontsize=14) or [Demo](https://codesandbox.io/s/3q1z35q53p?fontsize=14);

源代码请参考 [Code Sandbox](https://codesandbox.io/s/3q1z35q53p?fontsize=14) or [Demo](https://codesandbox.io/s/3q1z35q53p?fontsize=14);

```ts
import { EventHub, Whiteboard, MirrorWhiteboard } from 'fc-whiteboard';

// 构建消息中间件
const eventHub = new EventHub();

eventHub.on('sync', (changeEv: SyncEvent) => {
  console.log(changeEv);
});

const images = [
  'https://upload-images.jianshu.io/upload_images/1647496-6bede989c09af527.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240',
  'http://upload-images.jianshu.io/upload_images/1647496-d281090a702045e5.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240',
  'http://upload-images.jianshu.io/upload_images/1647496-611a416be07d7ca3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240'
];

// 初始化演讲者端
const whiteboard = new Whiteboard(document.getElementById('root') as HTMLDivElement, {
  sources: images,
  eventHub,
  // Enable this option to disable incremental sync, just use full sync
  onlyEmitSnap: false
});

whiteboard.open();

// 初始化镜像端，即观众端
const mirrorWhiteboard = new MirrorWhiteboard(
  document.getElementById('root-mirror') as HTMLDivElement,
  {
    sources: images,
    eventHub
  }
);

mirrorWhiteboard.open();
```

## WebSocket 集成

WebSocket 天然就是以事件驱动的消息通信，fc-whiteboard 内部对于消息有比较好的封装，我们建议使用者直接将消息透传即可：

```js
const wsEventHub = new EventEmitter();

if (isPresenter) {
  wsEventHub.on('sync', data => {
    if (data.event === 'finish') {
      // 单独处理结束事件
      if (typeof callback === 'function') {
        callback();
      }
    }
    const msg = {
      from: `${currentUser.id}`,
      type: 'room',
      to: `${chatroom.room_id}`,
      msg: {
        type: 'cmd',
        action: 'whiteboard/sync',
        message: JSON.stringify(data)
      }
    };
    socket.sendMessage(msg);
  });
} else {
  socket.onMessage(([data]) => {
    const {
      msg: { type, message }
    } = data;

    if (type === 'whiteboard/sync') {
      wsEventHub.emit('sync', JSON.parse(message));
    }
  });
}
```

## Whiteboard replay mode | 回放模式

fc-whiteboard 还支持回访模式，即我们可以将某次白板操作录制下来，可以一次性或者分批将事件传递给 ReplayWhiteboard，它就会按序播放：

```ts
import { ReplayWhiteboard } from 'fc-whiteboard';
import * as events from './events.json';

let hasSend = false;

const whiteboard = new ReplayWhiteboard(document.getElementById('root') as HTMLDivElement);

whiteboard.setContext(events[0].timestamp, async (t1, t2) => {
  if (!hasSend) {
    hasSend = true;
    return events as any;
  }

  return [];
});

whiteboard.open();
```

The persistent events are listed as follow:

事件的基本结构如下所示，具体的事件类别我们会在下文介绍：

```json
[
  {
    "event": "borderSnap",
    "id": "08e65660-6064-11e9-be21-fb33250b411f",
    "target": "whiteboard",
    "border": {
      "id": "08e65660-6064-11e9-be21-fb33250b411f",
      "sources": [
        "https://upload-images.jianshu.io/upload_images/1647496-6bede989c09af527.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240",
        "http://upload-images.jianshu.io/upload_images/1647496-d281090a702045e5.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240",
        "http://upload-images.jianshu.io/upload_images/1647496-611a416be07d7ca3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240"
      ],
      "pageIds": [
        "08e65661-6064-11e9-be21-fb33250b411f",
        "08e6a480-6064-11e9-be21-fb33250b411f",
        "08e6cb91-6064-11e9-be21-fb33250b411f"
      ],
      "visiblePageIndex": 0,
      "pages": [
        { "id": "08e65661-6064-11e9-be21-fb33250b411f", "markers": [] },
        { "id": "08e6a480-6064-11e9-be21-fb33250b411f", "markers": [] },
        { "id": "08e6cb91-6064-11e9-be21-fb33250b411f", "markers": [] }
      ]
    },
    "timestamp": 1555431837
  }
  ...
]
```

## Use drawboard alone | 单独使用 Drawboard

Drawboard 也可以单独使用作为画板，整体可以被导出为图片：

```html
<img id="root" src="https://upload-images.jianshu.io/upload_images/1647496-6bede989c09af527.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240"></img>
```

```ts
import { Drawboard } from 'fc-whiteboard/src';

const d = new Drawboard({
  imgEle: document.getElementById('root') as HTMLImageElement
});

d.open();
```

# 内部设计

fc-whiteboard 的内部组件级别，依次是 WhiteBoard, WhitePage, Drawboard 与 Marker，本节即介绍内部设计与实现。

![](https://i.postimg.cc/NjwLZ9Gf/image.png)

## Draw System | 绘制系统

绘制能力最初改造自 [markerjs](https://markerjs.com/)，在 Drawboard 中提供了基础的画板，即 boardCanvas 与 boardHolder，后续的所有 Marker 即挂载于 boardCanvas 中，并相对于其进行绝对定位。当我们添加某个 Marker，即执行以下步骤：

```ts
const marker = markerType.createMarker(this.page);

this.markers.push(marker);
this.selectMarker(marker);
this.boardCanvas.appendChild(marker.visual);

// 定位
marker.moveTo(x, y);
```

目前 fc-whiteboard 中内置了 ArrowMarker, CoverMarker, HighlightMarker, LineMarker, TextMarker 等多种 Marker：

```ts
export class BaseMarker extends DomEventAware {
  id: string = uuid();
  type: MarkerType = 'base';
  // 归属的 WhitePage
  page?: WhitePage;
  // 归属的 Drawboard
  drawboard?: Drawboard;
  // Marker 的属性发生变化后的回调
  onChange: onSyncFunc = () => {};

  // 其他属性
  // ...

  public static createMarker = (page?: WhitePage): BaseMarker => {
    const marker = new BaseMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  // 响应事件变化
  public reactToManipulation(
    type: EventType,
    { dx, dy, pos }: { dx?: number; dy?: number; pos?: PositionType } = {}
  ) {
    //  ...
  }

  /** 响应元素视图状态变化 */
  public manipulate = (ev: MouseEvent) => {
    // ...
  };

  public endManipulation() {
    // ...
  }

  public select() {
    // ...
  }

  public deselect() {
    // ...
  }

  /** 生成某个快照 */
  public captureSnap(): MarkerSnap {
    // ...
  }

  /** 应用某个快照 */
  public applySnap(snap: MarkerSnap): void {
    // ...
  }

  /** 移除该 Marker */
  public destroy() {
    this.visual.style.display = 'none';
  }

  protected resize(x: number, y: number, cb?: Function) {
    return;
  }
  protected resizeByEvent(x: number, y: number, pos?: PositionType) {
    return;
  }

  public move = (dx: number, dy: number) => {
    // ...
  };

  /** Move to relative position */
  public moveTo = (x: number, y: number) => {
    // ...
  };

  /** Init base marker */
  protected init() {
    // ...
  }

  protected addToVisual = (el: SVGElement) => {
    this.visual.appendChild(el);
  };

  protected addToRenderVisual = (el: SVGElement) => {
    this.renderVisual.appendChild(el);
  };

  protected onMouseDown = (ev: MouseEvent) => {
    // ...
  };

  protected onMouseUp = (ev: MouseEvent) => {
    // ...
  };

  protected onMouseMove = (ev: MouseEvent) => {
    // ...
  };
}
```

这里关于 Marker 的内部实现可以参考具体的 Marker，另外值得一提的是，想 LinearMarker, 或者 RectangleMarker 中，其需要响应对关键点拖拽引发的伸缩事件，这里的拖拽点是自定义的 Grip 组件。

## Event System | 事件系统

事件系统，最基础的理解就是用户的任何操作都会触发事件，也可以通过外部传入某个事件的方式来触发白板的界面变化。事件类型分为 Snapshot（snap）与 Key Actions（ka）两种。

首先是 Snapshot 事件，即快照事件；快照会记录完整的状态，整个白板可以从快照中快速恢复。白板级别的快照如下：

```ts
{
  id: this.id,
  sources: this.sources,
  pageIds: this.pages.map(page => page.id),
  visiblePageIndex: this.visiblePageIndex,
  pages: this.pages.map(p => p.captureSnap())
}
```

如果是 Shallow 模式，则不会下钻到具体的页面的快照。页面的快照即是 Marker 快照构成，每个 Marker 的快照则是朴素对象：

```ts
{
  id: this.id,
  type: this.type,
  isActive: this.isActive,
  x: this.x,
  y: this.y
}
```

一般来说，Whiteboard 会定期分发快照，可以通过 snapInterval 来控制间隔。而关键帧事件，则会在每一次界面变动时触发；该事件内建了 Debounce，但仍然会有比较多的数目。因此可以通过 onlyEmitSnap 来控制是否仅使用快照事件来同步。

关键帧事件的定义如下：

```ts
export interface SyncEvent {
  target: TargetType;

  // 当前事件触发者的 ID
  id?: string;
  parentId?: string;
  event: EventType;
  marker?: MarkerData;
  border?: WhiteboardSnap;
  timestamp?: number;
}
```

譬如当某个 Marker 发生移动时候，其会触发如下的事件：

```ts
this.onChange({ target: 'marker', id: this.id, event: 'moveMarker', marker: { dx, dy } });
```

仅在 WhiteBoard 与 WhitePage 级别提供了事件的响应，而在 Drawboard 与 Marker 级别提供了事件的触发。

# Todos

- [x] 结构化事件信息，添加绝对时间戳以适应重放的需求；将 WhitePage 中的事件响应统一提取到 Whiteboard 中。
- [x] 引入全量的状态订正，每 5 秒订正一次，设置线性 Marker 的全量同步规则
- [x] 设置矩形类 Marker 的全量同步规则，设置仅全量同步模式
- [x] 将白板划分为 Whiteboard, MirrorWhiteboard, ReplayWhiteboard 三种模式，开始编写录播模式，修复增量同步与全量同步冲突的问题。
- [x] 根据获得到的事件的时间进行重播，完善录播模式功能。
- [x] 优化 Toolbar 样式，增加 Toolbar 拖拽功能
- [x] 增加拖拽绘制功能
- [x] 添加全屏的绘制功能，全屏绘制会基于新的全局 div 元素，而非直接将当前元素扩大化
- [ ] 添加 Whiteboard 的 Loading 界面
- [ ] 支持编辑中途的缩放能力，将全屏的画板与局部画板的事件达到同步


# Home & More | 延伸阅读

![](https://i.postimg.cc/59QVkFPq/image.png)

您可以通过以下导航来在 Gitbook 中阅读笔者的系列文章，涵盖了技术资料归纳、编程语言与理论、Web 与大前端、服务端开发与基础架构、云计算与大数据、数据科学与人工智能、产品设计等多个领域：

- 知识体系：《[Awesome Lists](https://ngte-al.gitbook.io/i/)》、《[Awesome CheatSheets](https://ngte-ac.gitbook.io/i/)》、《[Awesome Interviews](https://github.com/wx-chevalier/Awesome-Interviews)》、《[Awesome RoadMaps](https://github.com/wx-chevalier/Awesome-RoadMaps)》、《[Awesome MindMaps](https://github.com/wx-chevalier/Awesome-MindMaps)》、《[Awesome-CS-Books-Warehouse](https://github.com/wx-chevalier/Awesome-CS-Books-Warehouse)》

- 编程语言：《[编程语言理论](https://ngte-pl.gitbook.io/i/)》、《[Java 实战](https://ngte-pl.gitbook.io/i/java/java)》、《[JavaScript 实战](https://ngte-pl.gitbook.io/i/javascript/javascript)》、《[Go 实战](https://ngte-pl.gitbook.io/i/go/go)》、《[Python 实战](https://ngte-pl.gitbook.io/i/python/python)》、《[Rust 实战](https://ngte-pl.gitbook.io/i/rust/rust)》

- 软件工程、模式与架构：《[编程范式与设计模式](https://ngte-se.gitbook.io/i/)》、《[数据结构与算法](https://ngte-se.gitbook.io/i/)》、《[软件架构设计](https://ngte-se.gitbook.io/i/)》、《[整洁与重构](https://ngte-se.gitbook.io/i/)》、《[研发方式与工具](https://ngte-se.gitbook.io/i/)》

* Web 与大前端：《[现代 Web 开发基础与工程实践](https://ngte-web.gitbook.io/i/)》、《[数据可视化](https://ngte-fe.gitbook.io/i/)》、《[iOS](https://ngte-fe.gitbook.io/i/)》、《[Android](https://ngte-fe.gitbook.io/i/)》、《[混合开发与跨端应用](https://ngte-fe.gitbook.io/i/)》

* 服务端开发实践与工程架构：《[服务端基础](https://ngte-be.gitbook.io/i/)》、《[微服务与云原生](https://ngte-be.gitbook.io/i/)》、《[测试与高可用保障](https://ngte-be.gitbook.io/i/)》、《[DevOps](https://ngte-be.gitbook.io/i/)》、《[Node](https://ngte-be.gitbook.io/i/)》、《[Spring](https://ngte-be.gitbook.io/i/)》、《[信息安全与渗透测试](https://ngte-be.gitbook.io/i/)》

* 分布式基础架构：《[分布式系统](https://ngte-infras.gitbook.io/i/)》、《[分布式计算](https://ngte-infras.gitbook.io/i/)》、《[数据库](https://ngte-infras.gitbook.io/i/)》、《[网络](https://ngte-infras.gitbook.io/i/)》、《[虚拟化与编排](https://ngte-infras.gitbook.io/i/)》、《[云计算与大数据](https://ngte-infras.gitbook.io/i/)》、《[Linux 与操作系统](https://ngte-infras.gitbook.io/i/)》

* 数据科学，人工智能与深度学习：《[数理统计](https://ngte-aidl.gitbook.io/i/)》、《[数据分析](https://ngte-aidl.gitbook.io/i/)》、《[机器学习](https://ngte-aidl.gitbook.io/i/)》、《[深度学习](https://ngte-aidl.gitbook.io/i/)》、《[自然语言处理](https://ngte-aidl.gitbook.io/i/)》、《[工具与工程化](https://ngte-aidl.gitbook.io/i/)》、《[行业应用](https://ngte-aidl.gitbook.io/i/)》

* 产品设计与用户体验：《[产品设计](https://ngte-pd.gitbook.io/i/)》、《[交互体验](https://ngte-pd.gitbook.io/i/)》、《[项目管理](https://ngte-pd.gitbook.io/i/)》

* 行业应用：《[行业迷思](https://github.com/wx-chevalier/Business-Series)》、《[功能域](https://github.com/wx-chevalier/Business-Series)》、《[电子商务](https://github.com/wx-chevalier/Business-Series)》、《[智能制造](https://github.com/wx-chevalier/Business-Series)》

此外，前往 [xCompass](https://wx-chevalier.github.io/home/#/search) 交互式地检索、查找需要的文章/链接/书籍/课程；或者在在 [MATRIX 文章与代码索引矩阵](https://github.com/wx-chevalier/Developer-Zero-To-Mastery)中查看文章与项目源代码等更详细的目录导航信息。最后，你也可以关注微信公众号：『**某熊的技术之路**』以获取最新资讯。

# Motivation & Credits

- [markerjs](https://markerjs.com/)
- [WeOutline](https://github.com/ipeychev/weoutline): WeOutline is a shared whiteboard, designed to work among distributed teams
