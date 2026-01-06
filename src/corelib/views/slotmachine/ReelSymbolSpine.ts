import ReelSymbol from '@core/views/slotmachine/ReelSymbol';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';

export default class ReelSymbolSpine extends ReelSymbol {
  constructor(configData: any) {
    super(configData);
  }

  protected createSymbol(): void {
    this.spine = UIUtil.getSpineAnim(this.configData.data.spineName, this.configData.data);
    this.addChild(this.spine);
    this.spine.scale.set(Util.getDefaultValue(this.configData.data.scale, 1));
  }

  public setBlurredTexture(): void {
    if (!this.isBlurred) {
      this.isBlurred = true;
      // this.alpha = 0.5;
    }
  }

  public setNormalTexture(): void {
    if (this.isBlurred) {
      this.isBlurred = false;
      this.alpha = 1;
    }
  }

  public showIdle(): void {
    if (this.spine && this.configData.data.idleAnimation) {
      this.spine.playAnimation({ state: this.configData.data.idleAnimation, loop: false });
    }
  }

  public stopIdleAnim(): void {
    if (this.spine && this.configData.data.defaultState) {
      this.spine.playAnimation({ state: this.configData.data.defaultState, loop: true });
    }
  }

  public showWin(): void {
    this.alpha = 1;
    if (this.spine && this.configData.data.winAnimation) {
      this.spine.playAnimation({ state: this.configData.data.winAnimation, loop: true });
    }
  }

  public showDimmed(): void {
    this.alpha = 0.5;
  }

  public clearAllWin(): void {
    this.alpha = 1;
    if (this.spine && this.configData.data.defaultState) {
      this.spine.playAnimation({ state: this.configData.data.defaultState, loop: true });
    }
  }
}
