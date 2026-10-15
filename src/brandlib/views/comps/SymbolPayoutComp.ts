import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class SymbolPayoutComp extends StandardView {
  private readonly infoText: PixText;
  private readonly bg: PixSprite;
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
    let hasPay = false;
    if (data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] > 0) {
          hasPay = true;
          break;
        }
      }
    }

    if (hasPay) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_GENERIC_SYMB_PAYOUT_SOUND);
      let result: string = '';
      const len = data.length;
      for (let i = 0; i < len; i++) {
        if (data[i] > 0) {
          result +=
            i + 1 + 'x: ' + Util.formatCurrency(appModel.getSymbolPayoutValue(data[i])) + (i == len - 1 ? '' : '\n');
        }
      }
      this.infoText.style.wordWrap = false;
      this.infoText.text = result;
    } else {
      let str = Util.getContent(symbol + 'payoutContent');
      if (str === symbol + 'payoutContent') {
        str = '';
      }

      if (str && str.length > 0) {
        EventHandler.dispatchEvent(SlotEvents.PLAY_GENERIC_SYMB_PAYOUT_SOUND);
        this.infoText.style.wordWrap = true;
        this.infoText.text = str;
      } else {
        this.visible = false;
        EventHandler.dispatchEvent(SlotEvents.HIDE_SYMBOL_PAYOUT);
      }
    }

    if (this.configData.centerText) {
      // The symbol covers one half of the bg, so centre the text in the half it leaves free.
      const freeHalfCenter = symbolAtLeft ? this.bg.width * 0.75 : this.bg.width * 0.25;
      this.infoText.x = freeHalfCenter - this.infoText.width / 2;
    } else if (symbolAtLeft) {
      this.infoText.x = this.bg.width - this.infoText.width - this.bg.width * this.configData.textXPadding;
    } else {
      this.infoText.x = this.bg.width * this.configData.textXPadding * 1.15;
    }
    this.infoText.y =
      (this.bg.height - this.infoText.height) / 2 +
      this.bg.height * Util.getDefaultValue(this.configData.textYPadding, 0);
  }

  public getXPadding(): number {
    return this.configData.xPadding;
  }

  public getYPadding(): number {
    return Util.getDefaultValue(this.configData.yPadding, 0);
  }
}
