import { WhitePage } from '../whiteboard/WhitePage/index';
import { RectMarker } from './../markers/RectMarker/index';
import { CoverMarker } from './../markers/CoverMarker/index';
import { TextMarker } from './../markers/TextMarker/index';
import { ArrowMarker } from './../markers/ArrowMarker/index';
import { HighlightMarker } from './../markers/HighlightMarker/index';
import { ToolbarItem } from './ToolbarItem';
import { LineMarker } from '../markers/LineMarker';

const OkIcon = require('../assets/check.svg');
const DeleteIcon = require('../assets/eraser.svg');
const CloseIcon = require('../assets/times.svg');

export const dragToolbarItem = new ToolbarItem({
  name: 'drag',
  tooltipText: 'Drag',
  icon: require('../assets/drag.svg')
});

export const highlightMarkerToolbarItem = new ToolbarItem({
  name: 'cover-marker',
  tooltipText: 'Hightlight',
  shortcut: 'Shift+H',
  icon: require('../assets/highlight.svg'),
  markerType: HighlightMarker,
  draggable: true
});

export const arrowMarkerToolbarItem = new ToolbarItem({
  name: 'arrow-marker',
  tooltipText: 'Arrow',
  shortcut: 'Shift+A',
  icon: require('../assets/arrow.svg'),
  markerType: ArrowMarker,
  draggable: true
});

export const textMarkerToolbarItem = new ToolbarItem({
  name: 'text-marker',
  tooltipText: 'Text',
  shortcut: 'Shift+T',
  icon: require('../assets/text.svg'),
  markerType: TextMarker,
  draggable: true
});

export const coverMarkerToolbarItem = new ToolbarItem({
  name: 'cover-marker',
  tooltipText: 'Cover',
  shortcut: 'Shift+C',
  icon: require('../assets/cover.svg'),
  markerType: CoverMarker,
  draggable: true
});

export const rectMarkerToolbarItem = new ToolbarItem({
  name: 'rect-marker',
  tooltipText: 'Rectangle',
  shortcut: 'Shift+R',
  icon: require('../assets/rect.svg'),
  markerType: RectMarker,
  draggable: true
});

export const lineMarkerToolbarItem = new ToolbarItem({
  name: 'line-marker',
  tooltipText: 'Line',
  shortcut: 'Shift+L',
  icon: require('../assets/line.svg'),
  markerType: LineMarker,
  draggable: true
});

export const closeToolbarItem = new ToolbarItem({
  icon: CloseIcon,
  name: 'close',
  tooltipText: 'Close'
});

export const separatorToolbarItem = new ToolbarItem({ name: 'separator', tooltipText: '' });

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
      tooltipText: 'Delete'
    },
    rectMarkerToolbarItem,
    coverMarkerToolbarItem,
    highlightMarkerToolbarItem,
    lineMarkerToolbarItem,
    arrowMarkerToolbarItem,
    textMarkerToolbarItem
  ];

  if (!page) {
    toolbars.push(
      ...[
        {
          icon: OkIcon,
          name: 'ok',
          tooltipText: 'OK'
        }
      ]
    );
  }

  return toolbars;
}
