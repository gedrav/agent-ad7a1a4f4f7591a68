import * as PIXI from 'pixi.js';
import { Texture } from 'pixi.js';
export class PixSprite extends PIXI.Sprite {
  protected _configData: any;
  public name: string;

  constructor(texture: Texture) {
    super(texture);
  }
  public setAnimationSpeed(num: number): void {}

  public playAnimation(options: any = null) {}

  public stopAnimation(): void {}
  public onComplete(): void {}

  public set configData(data: any) {
    this._configData = {};
    if (data) {
      for (const p in data) {
        this._configData[p] = data[p];
      }
    }
  }

  public get configData() {
    return this._configData;
  }

  getConfigData() {
    return this.configData;
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
}
