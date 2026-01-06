import * as PIXI from 'pixi.js';
import { Texture } from 'pixi.js';
import { GameProxy } from '@core/models/GameConfigProxy';

export class PixAnimatedSprite extends PIXI.AnimatedSprite {
  protected _configData: any;
  private repeat: number;
  private loopIndex: number;
  constructor(textureArray: Array<Texture>, config: any) {
    super(textureArray);
    this.configData = config;
    this.animationSpeed = GameProxy.config.globalAnimSpeed;
    this.onComplete = this.onAnimComplete.bind(this);
  }

  protected onAnimComplete(): void {
    this.loopIndex++;
    if (this.loopIndex == this.repeat) {
      this.emit('REPEAT_ANIMATION_COMPLETED');
    } else {
      this.gotoAndPlay(0);
    }
  }
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

  public playReverseAnimation(): void {
    this.gotoAndStop(this.totalFrames - 1);
    this.animationSpeed = -this.animationSpeed;
    this.loop = false;
    this.gotoAndPlay(this.totalFrames - 1);
  }

  public playAnimation(options: any = null) {
    if (!options) {
      options = {};
    }
    this.animationSpeed = GameProxy.config.globalAnimSpeed;
    this.loop = options.loop == undefined ? true : options.loop;
    this.repeat = options.repeat == undefined ? 1 : options.repeat;
    this.loopIndex = 0;
    this.gotoAndPlay(options.frameNumber == undefined ? 0 : options.frameNumber);
  }
  public destroySymbol(): void {
    this.stopAnimation();
  }

  public stopAnimation(): void {
    this.gotoAndStop(0);
  }

  public updateFrames(textureArray: Array<Texture>): void {
    this.textures = textureArray;
  }

  public getConfigData(): any {
    return this.configData;
  }

  public setAnimationSpeed(num: number): void {
    this.animationSpeed = num;
  }

  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
}
