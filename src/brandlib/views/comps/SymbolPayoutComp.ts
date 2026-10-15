import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AdjustableTextBox } from '@core/pixiwrapper/AdjustableTextBox';

export class SymbolPayoutComp extends StandardView {
  private readonly infoText: PixText;
  private readonly bg: PixSprite;
  constructor(config) {
    super(config);
    this.infoText = this.elementsList['infoText'];
    this.bg = this.elementsList['bg'];
    if (this.infoText instanceof AdjustableTextBox) {
      const inset = this.getTextXPadding();
      this.infoText.constrainBounds(this.bg.width * 0.5 - this.bg.width * inset, this.bg.height * 0.9);
    }
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
      const lines: string[] = [];
      const len = data.length;
      for (let i = 0; i < len; i++) {
        if (data[i] > 0) {
          lines.push(i + 1 + 'x: ' + Util.formatCurrency(appModel.getSymbolPayoutValue(data[i])));
        }
      }
      const autoFits = this.infoText instanceof AdjustableTextBox;
      this.infoText.style.wordWrap = autoFits && this.configData.centerText === true;
      this.infoText.text = lines.join('\n');
      if (!autoFits) {
        this.fitInfoText();
      }
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

    const pad = this.bg.width * this.getTextXPadding();
    if (this.configData.centerText) {
      const half = this.bg.width / 2;
      const areaStart = symbolAtLeft ? half : pad;
      const areaEnd = symbolAtLeft ? this.bg.width - pad : half;
      this.infoText.x = (areaStart + areaEnd) / 2 - this.infoText.width / 2;
    } else if (symbolAtLeft) {
      this.infoText.x = this.bg.width - this.infoText.width - pad;
    } else {
      this.infoText.x = pad * 1.15;
    }
    this.infoText.y =
      (this.bg.height - this.infoText.height) / 2 +
      this.bg.height * Util.getDefaultValue(this.configData.textYPadding, 0);
  }

  private fitInfoText(): void {
    const baseFontSize = this.infoText.style.fontSize;
    const minFontSize = 16;
    const maxWidth = this.bg.width * 0.5 - this.bg.width * this.getTextXPadding();
    if (this.infoText.width > maxWidth) {
      const ratio = maxWidth / this.infoText.width;
      this.infoText.style.fontSize = Math.max(minFontSize, Math.floor(baseFontSize * ratio));
    }
  }

  public getXPadding(): number {
    return Util.getDefaultValue(this.configData.xPadding, 0);
  }

  public getTextXPadding(): number {
    return Util.getDefaultValue(this.configData.textXPadding, 0.08);
  }

  public getYPadding(): number {
    return Util.getDefaultValue(this.configData.yPadding, 0);
  }
}
