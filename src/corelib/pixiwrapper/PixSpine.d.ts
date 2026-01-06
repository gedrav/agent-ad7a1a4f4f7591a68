import { Spine } from 'pixi-spine';
import { IDisplayObject } from '../Interfaces/IDisplayObject';
export declare class PixSpine extends Spine implements IDisplayObject {
  protected configData: any;
  protected anchor: any;
  constructor(name: string, configData: any);
  setSkin(name: string): void;
  addEventListener(event: string, callback: () => void): void;
  removeEventListners(): void;
  playAnimation(options: any): void;
  stopAnimation(): void;
  getWidth(): number;
  getHeight(): number;
}
