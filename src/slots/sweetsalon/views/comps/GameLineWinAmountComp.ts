import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';

export class GameLineWinAmountComp extends LineWinAmountComp {
  private readonly wildMultiplierText: PixText;
  private readonly multiplierImg: PixSprite;

  constructor(config) {
    super(config);
    this.wildMultiplierText = this.elementsList['wildMultiplierText'];
    this.multiplierImg = this.elementsList['multiplierImg'];
    this.multiplierImg.visible = false;
    this.multiplierImg.scale.set(0.5);
  }

  public reset(): void {
    super.reset();
    this.multiplierImg.visible = false;
  }

  public showWin(value: number, multiplier: number = 0): void {
    super.showWin(value);
    if (multiplier == 2 || multiplier == 4 || multiplier == 8) {
      this.multiplierImg.visible = true;
      this.multiplierImg.texture = UIUtil.getTexture('x' + multiplier);
    }
  }
}
