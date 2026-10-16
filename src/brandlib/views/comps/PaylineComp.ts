import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
export class PaylineComp extends StandardView {
  private readonly payline: PixSprite;
  constructor(config) {
    super(config);
    this.payline = UIUtil.getSprite(this.configData.image);
    this.addChild(this.payline);
  }
}
