import { AbstractProxy } from './AbstractProxy';
declare class DeviceConfigProxy extends AbstractProxy {
  protected _config: any;
  get config(): any;
  getIsLocal(): boolean;
  readDevice(): void;
  isDesktop(): boolean;
  checkOrientation(): number;
}
export declare const DeviceProxy: DeviceConfigProxy;
export {};
