import {
  ArrowSvg,
  CheckSvg,
  CoverSvg,
  DragSvg,
  EraserSvg,
  HighlightSvg,
  LineSvg,
  RectSvg,
  TextSvg,
  TimesSvg,
} from '../assets/svg';
import { LineMarker } from '../markers/LineMarker';
import { WhitePage } from '../whiteboard/WhitePage/index';

import { ArrowMarker } from './../markers/ArrowMarker/index';
import { CoverMarker } from './../markers/CoverMarker/index';
import { HighlightMarker } from './../markers/HighlightMarker/index';
import { RectMarker } from './../markers/RectMarker/index';
import { TextMarker } from './../markers/TextMarker/index';
import { ToolbarItem } from './ToolbarItem';

const OkIcon = CheckSvg;
const DeleteIcon = EraserSvg;
const CloseIcon = TimesSvg;

export const dragToolbarItem = new ToolbarItem({
  name: 'drag',
  tooltipText: 'Drag',
  icon: DragSvg,
});

export const highlightMarkerToolbarItem = new ToolbarItem({
  name: 'cover-marker',
  tooltipText: 'Hightlight',
  shortcut: 'Shift+H',
  icon: HighlightSvg,
  markerType: HighlightMarker,
  draggable: true,
});

export const arrowMarkerToolbarItem = new ToolbarItem({
  name: 'arrow-marker',
  tooltipText: 'Arrow',
  shortcut: 'Shift+A',
  icon: ArrowSvg,
  markerType: ArrowMarker,
  draggable: true,
});

export const textMarkerToolbarItem = new ToolbarItem({
  name: 'text-marker',
  tooltipText: 'Text',
  shortcut: 'Shift+T',
  icon: TextSvg,
  markerType: TextMarker,
  draggable: true,
});

export const coverMarkerToolbarItem = new ToolbarItem({
  name: 'cover-marker',
  tooltipText: 'Cover',
  shortcut: 'Shift+C',
  icon: CoverSvg,
  markerType: CoverMarker,
  draggable: true,
});

export const rectMarkerToolbarItem = new ToolbarItem({
  name: 'rect-marker',
  tooltipText: 'Rectangle',
  shortcut: 'Shift+R',
  icon: RectSvg,
  markerType: RectMarker,
  draggable: true,
});

export const lineMarkerToolbarItem = new ToolbarItem({
  name: 'line-marker',
  tooltipText: 'Line',
  shortcut: 'Shift+L',
  icon: LineSvg,
  markerType: LineMarker,
  draggable: true,
});

export const closeToolbarItem = new ToolbarItem({
  icon: CloseIcon,
  name: 'close',
  tooltipText: 'Close',
});

export const separatorToolbarItem = new ToolbarItem({
  name: 'separator',
  tooltipText: '',
});

export function getToolbars(page?: WhitePage) {
  const toolbars = [
    // {
    //   icon: PointerIcon,
    //   name: 'pointer',
    //   tooltipText: 'Pointer'
    // },
    {
      icon: DeleteIcon,
      name: 'delete',
      tooltipText: 'Delete',
    },
    rectMarkerToolbarItem,
    coverMarkerToolbarItem,
    highlightMarkerToolbarItem,
    lineMarkerToolbarItem,
    arrowMarkerToolbarItem,
    textMarkerToolbarItem,
  ];

  if (!page) {
    toolbars.push(
      ...[
        {
          icon: OkIcon,
          name: 'ok',
          tooltipText: 'OK',
        },
      ],
    );
  }

  return toolbars;
}
