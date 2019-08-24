import { MarkerType } from './../types';
import { SvgHelper } from '../../renderer/SvgHelper';
import { RectBaseMarker } from '../RectMarker/RectBaseMarker';
import { WhitePage } from '../../whiteboard/WhitePage';

export class HighlightMarker extends RectBaseMarker {
  type: MarkerType = 'highlight';

  public static createMarker = (page?: WhitePage): RectBaseMarker => {
    const marker = new HighlightMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  protected init() {
    super.init();
    SvgHelper.setAttributes(this.visual, [['class', 'highlight-marker']]);
  }
}
