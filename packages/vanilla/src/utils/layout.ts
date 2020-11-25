export type PositionType =
  | 'left'
  | 'right'
  | 'topLeft'
  | 'bottomLeft'
  | 'topRight'
  | 'bottomRight'
  | 'centerLeft'
  | 'centerRight'
  | 'topCenter'
  | 'bottomCenter';

/** 判断是否在某个包含的区域呢 */
export function rectContains(rect: ClientRect, { x, y }: { x: number; y: number }) {
  if (x < rect.left || x > rect.left + rect.width || y < rect.top || y > rect.top + rect.height) {
    return false;
  }

  return true;
}
