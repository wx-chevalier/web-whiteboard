import { Drawboard } from '../../src/index';

const d = new Drawboard({
  imgEle: document.getElementById('root') as HTMLImageElement,
});

d.open();
