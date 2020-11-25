import { ReplayWhiteboard } from './../../src/whiteboard/ReplayWhiteboard';
import * as events from './events.json';

let hasSend = false;

const whiteboard = new ReplayWhiteboard(
  document.getElementById('root') as HTMLDivElement,
);

whiteboard.setContext(events[0].timestamp, async (t1, t2) => {
  if (!hasSend) {
    hasSend = true;
    return events as any;
  }

  return [];
});

whiteboard.open();
