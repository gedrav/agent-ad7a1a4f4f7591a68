import { Texture } from 'pixi.js';
import * as PIXI from 'pixi.js';
export declare class PixAnimatedSprite extends PIXI.AnimatedSprite {
  protected _configData: any;
  constructor(textureArray: Array<Texture>);
  set configData(data: any);
  get configData(): any;
  playReverseAnimation(): void;
  playAnimation(options: any): void;
  stopAnimation(): void;
  updateFrames(textureArray: Array<Texture>): void;
  getConfigData(): any;
  getWidth(): number;
  getHeight(): number;
}
