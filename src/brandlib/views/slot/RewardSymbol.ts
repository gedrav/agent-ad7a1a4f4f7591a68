import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import { appModel } from '@core/models/services/AppModelService';
import { ColorMatrixFilter } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';

export default class RewardSymbol extends ReelSymbolSpine {
  private multiplierVal: PixText;
  constructor(configData: any) {
    super(configData);

    this.createReward();
  }
  protected createReward(): void {
    const tconfig: any = {
      name: 'multiplierVal',
      type: 'Text',
      style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 200 },
    };
    this.multiplierVal = UIUtil.getElement(tconfig);
    this.multiplierVal.anchor.set(0.5, 0.5);
    this.addChild(this.multiplierVal);
  }

  public setRewardData(multiplier: number): void {
    if (multiplier) {
      this.clearRewardData();
      this.multiplierVal.text = `x${multiplier}`;
      this.resizeMultiplier();
    }
  }

  public resizeMultiplier() {
    this.multiplierVal.style.fontSize = this.multiplierVal.configData.style.fontSize;
    if (this.multiplierVal.width > this.symbol.width * 0.54) {
      const factor = (this.symbol.width * 0.54) / this.multiplierVal.width;
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
}
