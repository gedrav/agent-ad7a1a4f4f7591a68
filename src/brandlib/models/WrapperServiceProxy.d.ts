import { AbstractProxy } from '@core/models/AbstractProxy';
declare class WrapperServiceProxy extends AbstractProxy {
  protected playerData: any;
  readURLParams(): void;
  getLanguage(): string;
  protected readLocalStorage(): void;
  notifyLoadingStart(): void;
  protected postDataToWrapper(data: any): void;
}
export declare const WrapperProxy: WrapperServiceProxy;
export {};
