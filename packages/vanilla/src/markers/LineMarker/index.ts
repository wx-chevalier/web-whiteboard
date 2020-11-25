import { MarkerType } from './../types';
import { LinearMarker } from '../LinearMarker';
import { SvgHelper } from './../../renderer/SvgHelper/index';
import { WhitePage } from '../../whiteboard/WhitePage';

export class LineMarker extends LinearMarker {
  type: MarkerType = 'line';

  public static createMarker = (page?: WhitePage): LinearMarker => {
    const marker = new LineMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  protected init() {
    super.init();
    SvgHelper.setAttributes(this.visual, [['class', 'line-marker']]);
  }
}
