import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import { appModel } from '@core/models/services/AppModelService';
import { ColorMatrixFilter } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export default class CascadeReelSymbol extends ReelSymbolSpine {
  private multiplierVal: PixText;
  private explosionMovie: PixSpine;

  constructor(configData: any) {
    super(configData);
    this.createExplosion();
    this.createReward();
  }
  protected createExplosion(): void {
    if (this.configData.data.explosion) {
      this.explosionMovie = UIUtil.getElement(this.configData.data.explosion);
      this.explosionMovie.stopAnimation();
      this.explosionMovie.addEventListener('complete', this.onExplosionAnimComplete.bind(this));
    }
  }
  protected createReward(): void {
    const tconfig: any = {
      name: 'multiplierVal',
      type: 'BitmapText',
      style: { fontFamily: 'bitmapFont', fill: 0xffffff, fontSize: 200 },
    };
    this.multiplierVal = UIUtil.getElement(tconfig);
    this.multiplierVal.anchor.set(0.5, 0.5);
    this.addChild(this.multiplierVal);
  }

  public setRewardData(multiplier: number): void {
    if (multiplier) {
      this.clearRewardData();
      this.multiplierVal.text = `${multiplier}x`;
      this.resizeMultiplier();
    }
  }

  public resizeMultiplier() {
    this.multiplierVal.style.fontSize = this.multiplierVal.configData.style.fontSize;
    if (this.multiplierVal.width > this.symbol.width * 0.41) {
      const factor = (this.symbol.width * 0.41) / this.multiplierVal.width;
      this.multiplierVal.style.fontSize = this.multiplierVal.configData.style.fontSize * factor;
    }
  }

  public setNormalTexture(): void {
    super.setNormalTexture();
    this.clearRewardData();
  }

  public clearRewardData(): void {
    this.multiplierVal.text = '';
  }

  public showFaded(): void {
    super.showFaded();
    const colorMatrixFilter = new ColorMatrixFilter();
    colorMatrixFilter.brightness(0.4, false);
    this.multiplierVal.filters = [colorMatrixFilter];
  }

  public cleanUpSymbolWin(): void {
    super.cleanUpSymbolWin();
    this.multiplierVal.filters = null;
  }

  public getTextElement() {
    return this.multiplierVal;
  }

  public showBlastAnim(onComplete?: () => void): void {
    if (!appModel.secondaryAssetsLoaded) {
      super.showBlastAnim();
      return;
    }
    if (this.configData.data.blastAnim) {
      this.addChildAt(this.explosionMovie, 0);
      this.explosionMovie.visible = true;
      const state = this.configData.data.explosion.defaultState;
      const loop: boolean = false;
      this.explosionMovie.playAnimation({ state, loop });
      this.spineAnimCompleteCallback = onComplete;
      this.playSpineAnimation(this.configData.data.blastAnim, false);
    } else {
      super.showBlastAnim();
    }
  }

  protected onExplosionAnimComplete(data: { animation: { name: string } }): void {
    this.explosionMovie.stopAnimation();
    this.removeChild(this.explosionMovie);
  }
}
