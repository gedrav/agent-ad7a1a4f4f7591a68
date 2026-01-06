export class AbstractProxy {
  protected facade: any;

  registerProxy(facade: any) {
    this.facade = facade;
  }
}
