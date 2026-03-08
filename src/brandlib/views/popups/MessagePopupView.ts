import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class MessagePopupView extends ResponsiveChildrenView {
  private closeBtn: any;
  private titleText: PixText;
  private messageText: PixText;
  private panelBG: PixSprite;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_MESSAGE_POPUP, this.showMessagePopup.bind(this));
    EventHandler.addEventListener(SlotEvents.CLOSE_MESSAGE_POPUP, this.closeMessagePopup.bind(this));
  }
  protected onViewCreated() {
    this.closeBtn = this.elementsList['closeBtn'];
    this.titleText = this.elementsList['titleText'];
    this.messageText = this.elementsList['messageText'];

    this.panelBG = this.elementsList['panelBG'];
    this.messageText.y = this.panelBG.height / 2;
    UIUtil.updateWordWrapWidth(this.messageText, this.panelBG.width * 0.8);
    this.visible = false;
  }

  protected async showMessagePopup(data: any) {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.visible = true;
    this.titleText.text = data.title;
    this.messageText.text = data.message;
  }

  protected async closeMessagePopup() {
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    this.parent.removeChild(this);
  }
}
