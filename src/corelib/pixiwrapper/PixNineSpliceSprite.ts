import * as PIXI from 'pixi.js';
import { Texture } from 'pixi.js';
export class PixNineSpliceSprite extends PIXI.NineSliceSprite {
  protected _configData: any;
  public name: string;

  constructor(texture: Texture) {
    super(texture);
  }
  protected checkForDimension() {
    if (this.configData.width != undefined) {
      this.width = this.configData.width;
    }
    if (this.configData.height != undefined) {
      this.height = this.configData.height;
    }
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
    this.checkForDimension();
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
