import { SyncEvent } from './../../src/event/SyncEvent';
import { EventHub } from './../../src/event/EventHub';
import { Whiteboard } from '../../src/whiteboard/Whiteboard/index';
import { MirrorWhiteboard } from '../../src/whiteboard/MirrorWhiteboard/index';

const eventHub = new EventHub();
const events: SyncEvent[] = [];

eventHub.on('sync', (changeEv: SyncEvent) => {
  if (changeEv.event !== 'borderSnap') {
    events.push(changeEv);
  }
  console.log(events);
});

const images = [
  'https://upload-images.jianshu.io/upload_images/1647496-6bede989c09af527.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240',
  'http://upload-images.jianshu.io/upload_images/1647496-d281090a702045e5.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240',
  'http://upload-images.jianshu.io/upload_images/1647496-611a416be07d7ca3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240'
];

const whiteboard = new Whiteboard(document.getElementById('root') as HTMLDivElement, {
  sources: images,
  eventHub,
  // Enable this option to disable incremental sync, just use full sync
  onlyEmitSnap: false,
  allowRollback: true
});

whiteboard.open();

const mirrorWhiteboard = new MirrorWhiteboard(
  document.getElementById('root-mirror') as HTMLDivElement,
  {
    sources: images,
    eventHub
  }
);

mirrorWhiteboard.open();
