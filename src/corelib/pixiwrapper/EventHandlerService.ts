class EventHandlerService {
  protected scope: any;

  constructor() {
    this.scope = null;
  }

  setScope(scope: any): void {
    this.scope = scope;
  }

  dispatchEvent(funcName: string, params: any = null): void {
    if (this.scope) {
      this.scope.emit(funcName, params);
    }
  }

  addEventListener(eventName: string, callback: (data?: any) => void): void {
    if (this.scope) {
      this.scope.on(eventName, callback);
    }
  }

  removeEventListener(eventName: string, callback: (data?: any) => void): void {
    if (this.scope) {
      this.scope.off(eventName, callback);
    }
  }
}

export const EventHandler = new EventHandlerService();
