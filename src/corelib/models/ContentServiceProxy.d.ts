import { AbstractProxy } from './AbstractProxy';
declare class ContentServiceProxy extends AbstractProxy {
  private _content;
  private _textConfig;
  constructor();
  setContent(data: any): void;
  setTextConfig(data: any): void;
  updateContent(data: any): void;
  updateTextConfig(data: any): void;
  get content(): any;
  get textConfig(): any;
}
export declare const ContentProxy: ContentServiceProxy;
export {};
