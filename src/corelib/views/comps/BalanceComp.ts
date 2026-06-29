import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';

export class BalanceComp extends StandardView {
  private readonly valueText: PixText;
  constructor(config) {
    super(config);
    this.valueText = this.elementsList['valueText'];
  }

  updateValue(balance: number) {
    this.valueText.text = Util.formatCurrency(balance);
  }
}
