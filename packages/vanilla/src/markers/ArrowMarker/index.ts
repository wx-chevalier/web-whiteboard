import { SvgHelper } from '../../renderer/SvgHelper';
import { WhitePage } from '../../whiteboard/WhitePage';
import { LinearMarker } from '../LinearMarker';

import { MarkerType } from './../types';

export class ArrowMarker extends LinearMarker {
  type: MarkerType = 'arrow';

  public static createMarker = (page?: WhitePage): LinearMarker => {
    const marker = new ArrowMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  private readonly ARROW_SIZE = 6;

  protected init() {
    super.init();
    SvgHelper.setAttributes(this.visual, [['class', 'arrow-marker']]);

    const tip = SvgHelper.createPolygon(
      `0,0 ${this.ARROW_SIZE},${this.ARROW_SIZE / 2} 0,${this.ARROW_SIZE}`,
      [['class', 'arrow-marker-tip']],
    );
    this.defs.push(
      SvgHelper.createMarker(
        'arrow-marker-head',
        'auto',
        this.ARROW_SIZE,
        this.ARROW_SIZE,
        this.ARROW_SIZE - 1,
        this.ARROW_SIZE / 2,
        tip,
      ),
    );

    this.markerLine.setAttribute('marker-end', 'url(#arrow-marker-head');
  }
}
