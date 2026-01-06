import * as PIXI from 'pixi.js';
import { PixGraphics } from './PixGraphics';
export declare class BaseView extends PIXI.Container {
  protected isDestroyed: boolean;
  protected configData: any;
  elementsList: {
    [key: string]: any;
  };
  protected guideRect: PixGraphics;
  constructor(configData: any);
  protected onUpdate(delta: number): void;
  createElements(): void;
  onInitialViewCreated(): void;
  getWidth(): number;
  getHeight(): number;
  getConfigData(): any;
  getLayoutData(): any;
  destroyView(): void;
  destroyComp(): void;
  show(): void;
  hide(): void;
}
