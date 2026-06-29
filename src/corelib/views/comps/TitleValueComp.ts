import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';

export class TitleValueComp extends StandardView {
  private readonly valueText: PixText;
  private readonly titleText: PixText;
  constructor(config) {
    super(config);
    this.valueText = this.elementsList['valueText'];
    this.titleText = this.elementsList['titleText'];
  }
}
