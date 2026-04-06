import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { GameProxy } from '@core/models/GameConfigProxy';

export class ModalView extends ResponsiveChildrenView {
  private modalRect: PixGraphics;
  constructor(config: any) {
    super(config);
    this.visible = false;
    this.modalRect = this.elementsList['modalRect'];
    UIUtil.addInteraction(this.modalRect, this.onModalClicked.bind(this));
    GameProxy.config.isModalOpened = false;
    EventHandler.addEventListener(SlotEvents.SHOW_MODAL_VIEW, this.showModalView.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MODAL_VIEW, this.hideModalView.bind(this));
  }
  protected showModalView(alpha: number = 0.8) {
    if (alpha == null) {
      // not sure why the default value is not working
      alpha = 0.8;
    }
    GameProxy.config.isModalOpened = true;
    this.alpha = alpha;
    this.visible = true;
  }
  protected hideModalView(): void {
    GameProxy.config.isModalOpened = false;
    this.visible = false;
  }
  protected onModalClicked(): void {
    if (GameProxy.config.isLongPressTriggered || GameProxy.config.isPopupOpened) {
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.MODAL_VIEW_CLICKED);
  }
}
