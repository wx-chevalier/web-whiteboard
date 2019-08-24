import { WhitePage } from '../../whiteboard/WhitePage/index';
import { MarkerType } from './../types';
import { RectBaseMarker } from './RectBaseMarker';
import { SvgHelper } from '../../renderer/SvgHelper';

export class RectMarker extends RectBaseMarker {
  type: MarkerType = 'rect';

  public static createMarker = (page?: WhitePage): RectBaseMarker => {
    const marker = new RectMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  protected init() {
    super.init();
    SvgHelper.setAttributes(this.visual, [['class', 'rect-marker']]);
  }
}
