import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

export class MessagePopupView extends ResponsiveChildrenView {
  private readonly closeBtn: any;
  private readonly titleText: PixText;
  private readonly messageText: PixText;
  private readonly panelBG: PixSprite;
  private callback: any;
  private readonly codeText: PixText;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_MESSAGE_POPUP, this.showMessagePopup.bind(this));
    EventHandler.addEventListener(SlotEvents.CLOSE_MESSAGE_POPUP, this.closeMessagePopup.bind(this));
    this.closeBtn = this.elementsList['closeBtn'];
    this.titleText = this.elementsList['titleText'];
    this.messageText = this.elementsList['messageText'];
    this.codeText = this.elementsList['codeText'];

    this.panelBG = this.elementsList['panelBG'];
    this.messageText.y = this.panelBG.height / 2;
    UIUtil.updateWordWrapWidth(this.messageText, this.panelBG.width * 0.8);
    this.closeBtn.onPress.connect(this.closeMessagePopup.bind(this));
  }

  protected async showMessagePopup(data: any) {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.visible = true;
    GameProxy.config.isPopupOpened = true;
    this.titleText.text = data.title;
    this.messageText.text = data.message;
    this.codeText.text = data.code ? Util.getContent('codeTextTitle') + data.code.toString() : '';
    this.callback = data.callback;
    if (data.code == 2300) {
      this.removeChild(this.closeBtn);
    }
  }

  protected async closeMessagePopup() {
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    this.parent.removeChild(this);
    if (this.callback) {
      this.callback();
    }
    if (appModel.getIsFreeSpinsSession()) {
      StateManager.goToState(STATES.CHECK_FS_STATE);
    }
  }
  protected resizeView() {
    if (DeviceProxy.config.isDesktop) {
      this.panelBG.width = this.panelBG.configData.width;
      this.panelBG.height = this.panelBG.configData.height;
    } else if (DeviceProxy.config.isPortrait) {
      this.panelBG.width = this.panelBG.configData.pWidth;
      this.panelBG.height = this.panelBG.configData.pHeight;
    } else {
      this.panelBG.width = this.panelBG.configData.lWidth;
      this.panelBG.height = this.panelBG.configData.lHeight;
    }
    super.resizeView();
  }
}
