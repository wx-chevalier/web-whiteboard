# Design Principles

Web whiteboard screencasting(both live and playback mode) with background slides, can be used as a graphics tablet for online tutoring or remote collaboration.

You can try it in [online demo](https://3q1z35q53p.codesandbox.io/).

# 演示者视图

# 学生视图

仅在 WhiteBoard 与 WhitePage 级别提供了事件的响应，而在 Drawboard 与 Marker 级别提供了事件的触发。事件类型分为 Snapshot（snap）与 Key Actions（ka）两种。

在 [Mushi-Chat](https://github.com/wx-chevalier/Mushi-Chat) 中，我们使用了简单的 WebSocket 来透传转发即可：

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

# 回放视图

# Todos

- [x] 结构化事件信息，添加绝对时间戳以适应重放的需求；将 WhitePage 中的事件响应统一提取到 Whiteboard 中。
- [x] 引入全量的状态订正，每 5 秒订正一次，设置线性 Marker 的全量同步规则
- [x] 设置矩形类 Marker 的全量同步规则，设置仅全量同步模式
- [x] 将白板划分为 Whiteboard, MirrorWhiteboard, ReplayWhiteboard 三种模式，开始编写录播模式，修复增量同步与全量同步冲突的问题。
- [x] 根据获得到的事件的时间进行重播，完善录播模式功能。
- [x] 优化 Toolbar 样式
- [x] 增加拖拽绘制功能
- [x] 工具栏优化：添加 destroy API，添加当前页与全部页指示
- [x] 优化图片的缩放情况，添加结束的按钮与触发事件
- [ ] 添加取色器，
- [ ] 添加全屏的绘制功能，全屏绘制会基于新的全局 div 元素，而非直接将当前元素扩大化
- [ ] 添加 Whiteboard 的 Loading 界面
- [ ] 支持编辑中途的缩放能力，将全屏的画板与局部画板的事件达到同步

# Motivation & Credits
