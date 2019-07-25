import { BorderEventType } from './border-events';
import { MarkerEventType, MarkerData } from './marker-events';
import { WhiteboardSnap } from '../whiteboard/AbstractWhiteboard/snap';

export type TargetType = 'whiteboard' | 'page' | 'marker';

export type EventType = MarkerEventType | BorderEventType;

export type onSyncFunc = (ev: SyncEvent) => void;

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
