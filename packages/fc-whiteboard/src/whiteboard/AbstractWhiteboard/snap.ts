import { MarkerType } from '../../markers/types';

export class WhiteboardSnap {
  id: string;
  sources: string[];
  pageIds: string[];
  visiblePageIndex: number;

  // 页面信息
  pages?: WhitepageSnap[];
}

export class WhitepageSnap {
  id: string;
  markers: MarkerSnap[];
}

export class MarkerSnap {
  id: string;
  type: MarkerType;
  isActive: boolean;
  x: number;
  y: number;

  // 线性元素的快照
  linearSnap?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };

  // 矩形元素的快照
  rectSnap?: {
    width: number;
    height: number;
  };

  textSnap?: {
    text: string;
  };
}
