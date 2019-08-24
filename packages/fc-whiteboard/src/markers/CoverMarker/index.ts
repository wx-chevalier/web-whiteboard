import { MarkerType } from './../types';
import { SvgHelper } from '../../renderer/SvgHelper';
import { RectBaseMarker } from '../RectMarker/RectBaseMarker';
import { WhitePage } from '../../whiteboard/WhitePage';

export class CoverMarker extends RectBaseMarker {
  type: MarkerType = 'cover';

  public static createMarker = (page?: WhitePage): RectBaseMarker => {
    const marker = new CoverMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  protected init() {
    super.init();
    SvgHelper.setAttributes(this.visual, [['class', 'cover-marker']]);
  }
}
