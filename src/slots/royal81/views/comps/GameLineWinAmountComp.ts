import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { PixText } from '@core/pixiwrapper/PixText';

export class GameLineWinAmountComp extends LineWinAmountComp {
  private wildMultiplierText: PixText;

  constructor(config) {
    super(config);
    this.wildMultiplierText = this.elementsList['wildMultiplierText'];
  }

  public reset(): void {
    super.reset();
    if (this.wildMultiplierText) this.wildMultiplierText.text = '';
  }

  public showWin(value: number, multiplier: number = 0): void {
    super.showWin(value);
    if (this.wildMultiplierText) {
      this.wildMultiplierText.text = multiplier > 1 ? `${multiplier}x` : '';
    }
  }
}
