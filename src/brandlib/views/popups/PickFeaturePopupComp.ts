import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';

export class PFPopupComp extends ResponsiveChildrenView {
  protected okBtn: any;
  protected titleText: PixText;
  protected messageText1: PixText;
  protected messageText2: PixText;
  private readonly panelBG: PixSprite;
  private callbackFunction: any;
  private readonly timeoutId: any;

  constructor(config: any) {
    super(config);
    this.okBtn = this.elementsList['okBtn'];
    this.titleText = this.elementsList['titleText'];
    this.messageText1 = this.elementsList['messageText1'];
    this.messageText2 = this.elementsList['messageText2'];

    this.panelBG = this.elementsList['popupbg'];
    this.okBtn.onPress.connect(this.onCloseClicked.bind(this));
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_PICK_FEATURE_POPUP, this.showPFPopup.bind(this));
  }

  protected async showPFPopup(data: any) {
    GameProxy.config.isPopupOpened = true;
    this.visible = true;
    this.titleText.text = data.title;

    this.updateMessagePositions(data);

    clearTimeout(this.timeoutId);
    // this.timeoutId = setTimeout(this.onTimerEnd.bind(this), 5000);
    this.messageText1.text = data.message1;
    this.callbackFunction = data.callbackFunction;
  }

  protected updateMessagePositions(data: any): void {
    // Adjust messageText1 position if a second message line is present
    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText1.y = 260;
      this.messageText2.text = data.message2;
    } else {
      this.messageText1.y = 330;
    }
  }

  protected onTimerEnd(): void {
    this.onCloseClicked();
  }

  protected async onCloseClicked() {
    GameProxy.config.isPopupOpened = false;
    if (!appModel.getIsLightningSession()) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    }
    clearTimeout(this.timeoutId);

    // Hide messageText2 to prevent showing again
    this.messageText2.visible = false;
    this.visible = false;
    if (this.callbackFunction) {
      this.callbackFunction();
    }
  }
}
