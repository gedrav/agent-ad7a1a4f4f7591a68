import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

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
              i + 1 + 'x: ' + Util.formatCurrency(appModel.getSymbolPayoutValue(data[i])) + (i == len - 1 ? '' : '\n');
          }
        }
        this.infoText.style.wordWrap = false;
        this.infoText.text = result;
        this.fitInfoText();
      }
    } else {
      const str = Util.getContent(symbol + 'payoutContent');
      if (str && str.length > 0) {
        this.infoText.style.fontSize = this.infoText.style.fontSize;
        this.infoText.style.wordWrap = true;
        this.infoText.style.wordWrapWidth = this.infoText.style.wordWrapWidth;
        this.infoText.text = str;
      } else {
        EventHandler.dispatchEvent(SlotEvents.HIDE_SYMBOL_PAYOUT);
      }
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

  private fitInfoText(): void {
    const baseFontSize = this.infoText.style.fontSize;

    const minFontSize = 16;

    const padding = this.bg.width * this.configData.textXPadding;

    const maxWidth = this.bg.width * 0.5 - padding;

    if (this.infoText.width > maxWidth) {
      const ratio = maxWidth / this.infoText.width;

      const newFontSize = Math.max(minFontSize, Math.floor(baseFontSize * ratio));

      this.infoText.style.fontSize = newFontSize;
    }
  }
}
