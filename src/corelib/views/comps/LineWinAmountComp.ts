import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';

export class LineWinAmountComp extends StandardView {
  private valueText: PixText;

  constructor(config) {
    super(config);
    this.valueText = this.elementsList['valueText'];
  }

  public reset(): void {
    this.valueText.text = '';
  }

  public showWin(value: number): void {
    this.valueText.text = Util.formatCurrencyNoSymbol(value);
  }
}
