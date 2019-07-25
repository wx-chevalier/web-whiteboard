import { PositionType } from '../../utils/layout';
import { SvgHelper } from '../../renderer/SvgHelper';
import { RectangularMarker } from '../RectangularMarker';
import { WhitePage } from '../../whiteboard/WhitePage';
import { MarkerSnap } from '../../whiteboard/AbstractWhiteboard/snap';

export class RectBaseMarker extends RectangularMarker {
  public static createMarker = (page?: WhitePage): RectBaseMarker => {
    const marker = new RectBaseMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  private markerRect: SVGRectElement;

  /** Getter & Setter */

  public applySnap(snap: MarkerSnap) {
    super.applySnap(snap);

    if (snap.rectSnap) {
      this.markerRect.setAttribute('width', this.width.toString());
      this.markerRect.setAttribute('height', this.height.toString());
    }
  }

  protected init() {
    super.init();

    this.markerRect = SvgHelper.createRect(this.width, this.height);
    this.addToRenderVisual(this.markerRect);
  }

  protected resize(x: number, y: number, onPosition?: (pos: PositionType) => void) {
    super.resize(x, y, onPosition);
    this.markerRect.setAttribute('width', this.width.toString());
    this.markerRect.setAttribute('height', this.height.toString());
  }
}
