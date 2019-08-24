import { MarkerType } from './../markers/types';
import { PositionType } from '../utils/layout';

export type MarkerEventType =
  // 添加
  | 'addMarker'
  // 尺寸重置
  | 'resizeMarker'
  // 移动
  | 'moveMarker'
  // 移除
  | 'removeMarker'
  // 改变 Marker 文本
  | 'inputMarker';

export interface MarkerData {
  id?: string;
  type?: MarkerType;

  // 内部数据
  text?: string;

  // 位置信息
  dx?: number;
  dy?: number;
  pos?: PositionType;
}
