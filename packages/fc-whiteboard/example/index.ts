import { SyncEvent } from './../src/event/SyncEvent';
import { EventHub } from './../src/event/EventHub';
import { Whiteboard } from '../src/whiteboard/Whiteboard/index';
import { MirrorWhiteboard } from '../src/whiteboard/MirrorWhiteboard/index';

let whiteboard: Whiteboard;

const events: SyncEvent[] = [];

const eventHub = new EventHub();
eventHub.on('sync', (changeEv: SyncEvent) => {
  if (changeEv.event !== 'borderSnap') {
    events.push(changeEv);
  }
  // console.log(changeEv);

  if (changeEv.event === 'finish') {
    whiteboard.destroy();
  }
});

const images = [
  'https://i.postimg.cc/RZwf0MRw/image.png',
  'https://i.postimg.cc/YjK6XjRq/image.png',
  'https://i.postimg.cc/VN6K0rH3/image.png'
];

whiteboard = new Whiteboard(document.getElementById('root') as HTMLDivElement, {
  sources: images,
  eventHub,
  // Enable this option to disable incremental sync, just use full sync
  onlyEmitSnap: false,
  allowRollback: true
});

whiteboard.open();

// setTimeout(() => {
//   whiteboard.hide();
// }, 1000);

const mirrorWhiteboard = new MirrorWhiteboard(
  document.getElementById('root-mirror') as HTMLDivElement,
  {
    sources: images,
    eventHub
  }
);

mirrorWhiteboard.open();
