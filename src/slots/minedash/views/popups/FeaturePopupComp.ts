import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';

import { WinTicker } from '@core/views/comps/WinTicker';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

const DEFAULT_AUTO_CLOSE_DELAY = 4500;
const TICKER_COUNT_DURATION = 1500;
const TICKER_HOLD_DELAY = 3000;

export class FeaturePopupComp extends ResponsiveChildrenView {
  protected titleText: PixText;
  protected messageText1: PixText;

  protected winTicker: WinTicker;
  protected readonly panelBG: any;
  protected callbackFunction: any;
  protected timeoutId: any;

  constructor(config: any) {
    super(config);
    this.titleText = this.elementsList['titleText'];
    this.messageText1 = this.elementsList['messageText1'];

    this.winTicker = this.elementsList['winTicker'];
    this.panelBG = this.elementsList['popupbg'];
    this.winTicker?.reset();
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_FS_POPUP, this.showPopup.bind(this));
  }

  protected showPopup(data: any = {}): void {
    GameProxy.config.isPopupOpened = true;
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    clearTimeout(this.timeoutId);

    if (data.entryPopUp) {
      data = {
        ...data,
        title: Util.getContent('freeSpinsHeading') || 'FREE SPINS',
        message1: String(appModel.getTotalFreespins()),
      };
    } else if (data.entryPopUp === false) {
      data = {
        ...data,
        title: Util.getContent('totalWinHeading') || 'TOTAL WIN',
        tickerValue: appModel.getTotalFreespinWinAmount(),
      };
    }

    this.titleText.text = data.title ?? '';
    this.callbackFunction = data.callbackFunction;
    this.visible = true;

    const isMystery = data.entryPopUp === undefined;
    const animState = isMystery ? 'Mystery_Ideal' : 'FreeSpin_Ideal';
    if (this.panelBG?.playAnimation) {
      this.panelBG.playAnimation({ state: animState, loop: true });
      if (this.panelBG.spineAnim) {
        this.panelBG.spineAnim.skeleton.setAttachment('Bar/Glow', 'Group 5 copy');
      }
    }

    if (data.tickerValue != undefined) {
      this.messageText1.visible = false;
      this.winTicker.visible = true;
      this.winTicker.reset();
      this.winTicker.once('COUNTUP_COMPLETED', () => {
        this.timeoutId = setTimeout(this.onAutoClose.bind(this), data.holdDuration ?? TICKER_HOLD_DELAY);
      });
      this.winTicker.countUpValue(data.tickerValue, data.tickerDuration ?? TICKER_COUNT_DURATION, true);
      return;
    }

    this.winTicker.visible = false;
    this.messageText1.text = data.message1 ?? '';

    this.messageText1.visible = true;

    this.timeoutId = setTimeout(this.onAutoClose.bind(this), data.duration ?? DEFAULT_AUTO_CLOSE_DELAY);
  }

  protected onAutoClose(): void {
    GameProxy.config.isPopupOpened = false;
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    this.visible = false;
    if (this.callbackFunction) {
      this.callbackFunction();
    }
  }

  public destroy(options?: any): void {
    clearTimeout(this.timeoutId);
    super.destroy(options);
  }
}
