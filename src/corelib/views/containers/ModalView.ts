import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export class ModalView extends ResponsesiveChildrenView {
  private modalRect: PixGraphics;
  constructor(config: any) {
    super(config);
    this.visible = false;
    this.modalRect = this.elementsList['modalRect'];
    UIUtil.addInteraction(this.modalRect, this.onModalClicked.bind(this));

    EventHandler.addEventListener(SlotEvents.SHOW_MODAL_VIEW, this.showModalView.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MODAL_VIEW, this.hideModalView.bind(this));
  }
  protected showModalView() {
    this.alpha = 0;
    this.visible = true;
    AnimationProxy.fadeIn(this, 0.5);
  }
  protected hideModalView(): void {
    AnimationProxy.fadeOut(this, 0.2, this.onFadedOut.bind(this));
  }
  protected onModalClicked(): void {
    EventHandler.dispatchEvent(SlotEvents.MODAL_VIEW_CLICKED);
  }
  protected onFadedOut(): void {
    this.visible = false;
    this.alpha = 1;
  }
}
