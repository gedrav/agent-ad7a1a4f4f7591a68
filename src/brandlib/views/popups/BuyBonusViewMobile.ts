import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Sine } from 'gsap/gsap-core';
import { GameProxy } from '@core/models/GameConfigProxy';

export class BuyBonusViewMobile extends BuyBonusView {
  private readonly topbar: PixGraphics;
  private readonly closeBtn: PixFancyButton;

  constructor(config: any) {
    super(config);
    // this.closeBtn = this.elementsList['bbCont'].elementsList['closeBtn'];
    this.closeBtn = this.elementsList['closeBtn'];
    if (this.closeBtn) {
      this.closeBtn.onPress.connect(this.closeBuyBonus.bind(this));
    }
  }

  protected async showBuyBonusView(bbId: any) {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW, 0);
    this.x = -this.width;
    this.alpha = 1;
    this.visible = true;
    GameProxy.config.selectedBB = bbId;
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
