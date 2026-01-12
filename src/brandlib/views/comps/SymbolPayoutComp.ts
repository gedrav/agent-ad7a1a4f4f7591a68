import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { i } from 'vite/dist/node/types.d-aGj9QkWt';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';

export class SymbolPayoutComp extends StandardView {
  private infoText: PixText;
  private bg: PixSprite;
  constructor(config) {
    super(config);
    this.infoText = this.elementsList['infoText'];
    this.bg = this.elementsList['bg'];
    UIUtil.setModalState(this.bg);
    this.visible = false;
  }

  public showComp(symbol: string, symbolAtLeft: boolean): void {
    this.infoText.text = '';
    const pays = appModel.getPaytableData();
    const data = pays[symbol];
    if (data) {
      let result: string = '';
      const len = data.length;
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          if (data[i] > 0) {
            result +=
              i + 'x: ' + Util.formatCurrency(appModel.getSymbolPayoutValue(data[i])) + (i == len - 1 ? '' : '\n');
          }
        }
        this.infoText.text = result;
      }
    } else {
      this.infoText.text = Util.getContent(symbol + 'payoutContent');
    }
    if (symbolAtLeft) {
      this.infoText.x = this.bg.width - this.infoText.width - this.bg.width * this.configData.textXPadding;
    } else {
      this.infoText.x = this.bg.width * this.configData.textXPadding * 1.15;
    }
    this.infoText.y = (this.bg.height - this.infoText.height) / 2;
  }

  public getXPadding(): number {
    return this.configData.xPadding;
  }
}
