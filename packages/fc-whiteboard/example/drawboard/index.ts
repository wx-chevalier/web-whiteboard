import { Drawboard } from 'fc-whiteboard/src';

const d = new Drawboard({
  imgEle: document.getElementById('root') as HTMLImageElement
});

d.open();
