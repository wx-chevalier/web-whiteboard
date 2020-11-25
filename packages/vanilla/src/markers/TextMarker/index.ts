import { MarkerType } from '../types';
import { RectangularMarker } from '../RectangularMarker';
import { SvgHelper } from '../../renderer/SvgHelper';
import { WhitePage } from '../../whiteboard/WhitePage';
import { PositionType } from '../../utils/layout';
import { MarkerSnap } from '../../whiteboard/AbstractWhiteboard/snap';

const OkIcon = require('../../assets/check.svg');
const CancelIcon = require('../../assets/times.svg');

export class TextMarker extends RectangularMarker {
  type: MarkerType = 'text';

  public static createMarker = (page?: WhitePage): TextMarker => {
    const marker = new TextMarker();
    marker.page = page;
    marker.init();
    return marker;
  };

  /** UI Options */
  protected readonly MIN_SIZE = 50;
  private readonly DEFAULT_TEXT = 'Double-click to edit text';
  private text: string = this.DEFAULT_TEXT;
  private inDoubleTap = false;

  /** UI Handlers */
  private textElement: SVGTextElement;
  private editor?: HTMLDivElement;
  private editorTextArea: HTMLTextAreaElement;

  /** Getter & Setter */
  public setText(text: string) {
    this.text = text;
    this.renderText();
  }

  public captureSnap(): MarkerSnap {
    const baseSnap = super.captureSnap();

    baseSnap.textSnap = { text: this.text };

    return baseSnap;
  }

  public applySnap(snap: MarkerSnap) {
    super.applySnap(snap);

    if (snap.textSnap && snap.textSnap.text !== this.text) {
      this.setText(snap.textSnap.text);
    }
  }

  protected init() {
    super.init();
    this.textElement = SvgHelper.createText();
    this.addToRenderVisual(this.textElement);
    SvgHelper.setAttributes(this.visual, [['class', 'text-marker']]);

    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // translate transorm
    this.textElement.transform.baseVal.appendItem(SvgHelper.createTransform()); // scale transorm

    this.renderText();

    this.visual.addEventListener('dblclick', this.onDblClick);
    this.visual.addEventListener('touchstart', this.onTap);
  }

  protected resize(x: number, y: number, onPosition?: (pos: PositionType) => void) {
    super.resize(x, y, onPosition);

    this.sizeText();
  }

  private renderText = () => {
    const LINE_SIZE = '1.2em';

    while (this.textElement.lastChild) {
      this.textElement.removeChild(this.textElement.lastChild);
    }

    const lines = this.text.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
    for (let line of lines) {
      if (line.trim() === '') {
        line = ' '; // workaround for swallowed empty lines
      }
      this.textElement.appendChild(SvgHelper.createTSpan(line, [['x', '0'], ['dy', LINE_SIZE]]));
    }

    setTimeout(this.sizeText, 10);
  };

  /** 执行文本的自动适配 */
  private sizeText = () => {
    const textSize = this.textElement.getBBox();
    let x = 0;
    let y = 0;
    let scale = 1.0;
    if (textSize.width > 0 && textSize.height > 0) {
      const xScale = (this.width * 1.0) / textSize.width;
      const yScale = (this.height * 1.0) / textSize.height;
      scale = Math.min(xScale, yScale);

      x = (this.width - textSize.width * scale) / 2;
      y = (this.height - textSize.height * scale) / 2;
    }

    this.textElement.transform.baseVal.getItem(0).setTranslate(x, y);
    this.textElement.transform.baseVal.getItem(1).setScale(scale, scale);
  };

  private onDblClick = (ev: MouseEvent) => {
    this.showEditor();
  };

  private onTap = (ev: TouchEvent) => {
    if (this.inDoubleTap) {
      this.inDoubleTap = false;
      this.showEditor();
    } else {
      this.inDoubleTap = true;
      setTimeout(() => {
        this.inDoubleTap = false;
      }, 300);
    }
  };

  private showEditor = () => {
    // 确保仅创建单个 Editor 对象
    if (this.editor) {
      return;
    }

    this.editor = document.createElement('div');
    this.editor.className = 'fc-whiteboard-text-editor';

    this.editorTextArea = document.createElement('textarea');
    if (this.text !== this.DEFAULT_TEXT) {
      this.editorTextArea.value = this.text;
    }
    this.editorTextArea.addEventListener('keydown', this.onEditorKeyDown);
    this.editor.appendChild(this.editorTextArea);

    if (this.drawboard) {
      this.drawboard.boardHolder.appendChild(this.editor);
    } else {
      document.body.appendChild(this.editor);
    }

    const buttons = document.createElement('div');
    buttons.className = 'fc-whiteboard-text-editor-button-bar';
    this.editor.appendChild(buttons);

    const okButton = document.createElement('div');
    okButton.className = 'fc-whiteboard-text-editor-button';
    okButton.innerHTML = OkIcon;
    okButton.addEventListener('click', this.onEditorOkClick);
    buttons.appendChild(okButton);

    const cancelButton = document.createElement('div');
    cancelButton.className = 'fc-whiteboard-text-editor-button';
    cancelButton.innerHTML = CancelIcon;
    cancelButton.addEventListener('click', this.closeEditor);
    buttons.appendChild(cancelButton);
  };

  /** 响应文本输入的事件 */
  private onEditorOkClick = (ev: MouseEvent | null) => {
    if (this.editorTextArea.value.trim()) {
      this.text = this.editorTextArea.value;
    } else {
      this.text = this.DEFAULT_TEXT;
    }

    // 触发文本修改时间
    this.onChange({
      target: 'marker',
      id: this.id,
      event: 'inputMarker',
      marker: { text: this.text }
    });

    this.renderText();
    this.closeEditor();
  };

  private closeEditor = () => {
    if (this.editor && this.editor.parentElement) {
      this.editor.parentElement.removeChild(this.editor);
      this.editor = undefined;
    }
  };

  private onEditorKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter' && ev.ctrlKey) {
      ev.preventDefault();
      this.onEditorOkClick(null);
    }
  };
}
