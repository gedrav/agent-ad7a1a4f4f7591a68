declare class EventHandlerService {
  protected scope: any;
  constructor();
  setScope(scope: any): void;
  dispatchEvent(funcName: string, params?: any): void;
  addEventListener(eventName: string, callback: () => void): void;
  removeEventListener(eventName: string, callback: () => void): void;
}
export declare const EventHandler: EventHandlerService;
export {};
