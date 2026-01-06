import { Texture } from 'pixi.js';
import * as PIXI from 'pixi.js';
export declare class PixSprite extends PIXI.Sprite {
  protected _configData: any;
  constructor(texture: Texture);
  playAnimation(options: any): void;
  set configData(data: any);
  get configData(): any;
  getConfigData(): any;
  getWidth(): number;
  getHeight(): number;
}
