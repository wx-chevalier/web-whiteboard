import EventEmitter from 'eventemitter3';

export class EventHub extends EventEmitter<'sync'> {}
