import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import { appModel } from '@core/models/services/AppModelService';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export default class CascadeReelSymbol extends ReelSymbolSpine {
  private multiplierVal: PixText;
  private explosionMovie: PixSpine;

  constructor(configData: any) {
    super(configData);
    this.createExplosion();
    this.createMultiplierText();
  }
  protected createExplosion(): void {
    if (this.configData.data.explosion) {
      this.explosionMovie = UIUtil.getElement(this.configData.data.explosion);
      this.explosionMovie.stopAnimation();
      this.explosionMovie.addEventListener('complete', this.onExplosionAnimComplete.bind(this));
    }
  }
  protected createMultiplierText(): void {
    const tconfig = this.configData.data.multiplierTextConfig;
    this.multiplierVal = UIUtil.getElement(tconfig);
    this.multiplierVal.anchor.set(tconfig.anchor?.x ?? 0.5, tconfig.anchor?.y ?? 0.5);
    this.multiplierVal.x = tconfig.x ?? 0;
    this.multiplierVal.y = tconfig.y ?? 0;
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
    this.multiplierVal.alpha = 0.4;
  }

  public cleanUpSymbolWin(): void {
    super.cleanUpSymbolWin();
    this.multiplierVal.alpha = 1;
  }

  public getTextElement() {
    return this.multiplierVal;
  }

  public showBlastAnim(onComplete?: () => void): void {
    if (!appModel.secondaryAssetsLoaded) {
      super.showBlastAnim(onComplete);
      return;
    }
    if (this.configData.data.blastAnim) {
      if (this.explosionMovie) {
        this.addChildAt(this.explosionMovie, 0);
        this.explosionMovie.visible = true;
        const state = this.configData.data.explosion.defaultState;
        const loop: boolean = false;
        this.explosionMovie.playAnimation({ state, loop });
      }
      this.spineAnimCompleteCallback = onComplete;
      this.playSpineAnimation(this.configData.data.blastAnim, false);
    } else {
      // if no blast anim in config then we dont show any blast anim and directly call the oncomplete
      onComplete();
    }
  }

  protected onExplosionAnimComplete(data: { animation: { name: string } }): void {
    this.explosionMovie.stopAnimation();
    this.removeChild(this.explosionMovie);
  }
}
