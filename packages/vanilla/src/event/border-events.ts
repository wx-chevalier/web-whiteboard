export type BorderEventType =
  // 完全的状态同步，FCW 支持两种状态的同步交换：Snapshot(Snap) 与 KeyActions(KA) 方式
  | 'borderSnap'
  // 下标改变
  | 'borderChangePage'
  // 结束
  | 'finish';
