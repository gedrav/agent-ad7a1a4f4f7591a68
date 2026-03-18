import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Sine } from 'gsap/gsap-core';

export class BuyBonusViewMobile extends BuyBonusView {
  private topbar: PixGraphics;
  private closeBtn: PixFancyButton;

  constructor(config: any) {
    super(config);
    this.closeBtn = this.elementsList['bbCont'].elementsList['closeBtn'];
    if (this.closeBtn) {
      this.closeBtn.onPress.connect(this.closeBuyBonus.bind(this));
    }
  }

  protected async showBuyBonusView() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW, 0);
    this.x = -this.width;
    this.alpha = 1;
    this.visible = true;
    this.updateBuyBonusPanel();
    this.resizeView();
    AnimationProxy.animateTween(this, { duration: 0.2, x: 0, ease: Sine.easeOut });
  }

  protected closeBuyBonus(): void {
    AnimationProxy.animateTween(this, { duration: 0.2, x: -this.width, onComplete: this.onBBHidden.bind(this) });
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
  }
  protected onBBHidden(): void {
    EventHandler.dispatchEvent(SlotEvents.HIDE_BUY_BONUS_VIEW);
  }
}
