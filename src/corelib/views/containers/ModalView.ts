import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { GameProxy } from '@core/models/GameConfigProxy';

export class ModalView extends ResponsiveChildrenView {
  private modalRect: PixGraphics;
  private pressedOnModal = false;
  constructor(config: any) {
    super(config);
    this.visible = false;
    this.modalRect = this.elementsList['modalRect'];
    this.modalRect.eventMode = 'static';
    this.modalRect.on('pointerdown', this.onModalDown, this);
    this.modalRect.on('pointerup', this.onModalUp, this);
    this.modalRect.on('pointerupoutside', this.onModalUpOutside, this);
    GameProxy.config.isModalOpened = false;
    EventHandler.addEventListener(SlotEvents.SHOW_MODAL_VIEW, this.showModalView.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MODAL_VIEW, this.hideModalView.bind(this));
  }
  protected showModalView(alpha: number = 0.8) {
    if (alpha == null) {
      // not sure why the default value is not working
      alpha = 0.8;
    }
    this.pressedOnModal = false;
    GameProxy.config.isModalOpened = true;
    this.alpha = alpha;
    this.visible = true;
  }
  protected hideModalView(): void {
    this.pressedOnModal = false;
    GameProxy.config.isModalOpened = false;
    this.visible = false;
  }
  private onModalDown(): void {
    this.pressedOnModal = true;
  }
  private onModalUpOutside(): void {
    this.pressedOnModal = false;
  }
  private onModalUp(): void {
    if (!this.pressedOnModal) return;
    this.pressedOnModal = false;
    if (GameProxy.config.isLongPressTriggered || GameProxy.config.isPopupOpened) {
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.MODAL_VIEW_CLICKED);
  }
}
