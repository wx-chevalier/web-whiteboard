import { HighlightMarker } from './HighlightMarker/index';
import { TextMarker } from './TextMarker/index';
import { ArrowMarker } from './ArrowMarker/index';
import { BaseMarker } from './BaseMarker/index';
import { CoverMarker } from './CoverMarker';
import { LineMarker } from './LineMarker';
import { RectMarker } from './RectMarker';

export type MarkerType = 'base' | 'arrow' | 'cover' | 'line' | 'rect' | 'text' | 'highlight';

export interface LinearBound {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function getMarkerByType(type: MarkerType): typeof BaseMarker {
  switch (type) {
    case 'arrow':
      return ArrowMarker;
    case 'base':
      return BaseMarker;
    case 'cover':
      return CoverMarker;
    case 'highlight':
      return HighlightMarker;
    case 'line':
      return LineMarker;
    case 'rect':
      return RectMarker;
    case 'text':
      return TextMarker;
    default:
      return BaseMarker;
  }
}
