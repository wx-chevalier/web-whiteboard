import { isHTMLImageElement } from '../../utils/validator';

/** 图片导出，将原图片与 Svgs 绘制到某个 Canvas 中 */
export class Synthetizer {
  public rasterize(
    // target 是原图片
    target: HTMLImageElement,
    markerImage: SVGSVGElement,
    done: (dataUrl: string) => void,
  ) {
    if (!isHTMLImageElement(target)) {
      throw new Error('Error: only support export to HTMLImageElement');
    }

    const canvas = document.createElement('canvas');
    canvas.width = markerImage.width.baseVal.value;
    canvas.height = markerImage.height.baseVal.value;

    const data = markerImage.outerHTML;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Invalid ctx');
    }

    ctx.drawImage(
      target as HTMLImageElement,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const DOMURL = window.URL; // || window.webkitURL || window;

    const img = new Image(canvas.width, canvas.height);
    img.setAttribute('crossOrigin', 'anonymous');

    const blob = new Blob([data], { type: 'image/svg+xml' });

    const url = DOMURL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      done(canvas.toDataURL('image/png'));
    };

    img.src = url;
  }
}
