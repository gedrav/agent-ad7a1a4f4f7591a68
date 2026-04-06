import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';

export class FSPopupComp extends ResponsiveChildrenView {
  private okBtn: any;
  private titleText: PixText;
  private messageText1: PixText;
  private messageText2: PixText;
  private panelBG: PixSprite;
  private callbackFunction: any;
  private timeoutId: any;

  constructor(config: any) {
    super(config);
    this.okBtn = this.elementsList['okBtn'];
    this.titleText = this.elementsList['titleText'];
    this.messageText1 = this.elementsList['messageText1'];
    this.messageText2 = this.elementsList['messageText2'];

    this.panelBG = this.elementsList['popupbg'];
    this.okBtn.onPress.connect(this.onCloseClicked.bind(this));
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_FS_POPUP, this.showFSPopup.bind(this));
  }

  protected async showFSPopup(data: any) {
    GameProxy.config.isPopupOpened = true;
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.visible = true;
    this.titleText.text = data.title;

    // Adjust messageText1 position based on unfinished case
    if (data.message2 && this.messageText2.visible !== false) {
      this.messageText1.y = 345; // Unfinished case
      this.messageText2.text = data.message2;
    } else {
      this.messageText1.y = 400; // Normal case
    }
    clearTimeout(this.timeoutId);
    // this.timeoutId = setTimeout(this.onTimerEnd.bind(this), 5000);
    this.messageText1.text = data.message1;
    this.callbackFunction = data.callbackFunction;
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
    EventHandler.dispatchEvent('START_FREESPIN_BG_MUSIC');
    this.visible = false;
    if (this.callbackFunction) {
      this.callbackFunction();
    }
    this.parent.removeChild(this);
  }
}
