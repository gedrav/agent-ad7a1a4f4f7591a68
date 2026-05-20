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

  // Bind a handler and return a disposer. Use for view-scoped listeners so a
  // single dispose() call removes every listener the view registered without
  // every caller having to store and pair refs manually.
  bind(eventName: string, callback: (data?: any) => void): () => void {
    if (!this.scope) return () => {};
    this.scope.on(eventName, callback);
    return () => {
      this.scope?.off(eventName, callback);
    };
  }

  // Remove all listeners for a single event name. Useful when a view owns the
  // event exclusively and wants to clear stragglers on destroy.
  removeAllListeners(eventName: string): void {
    if (this.scope) {
      this.scope.removeAllListeners(eventName);
    }
  }
}

export const EventHandler = new EventHandlerService();
