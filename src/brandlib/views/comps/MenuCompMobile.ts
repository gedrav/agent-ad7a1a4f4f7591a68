import { MenuComp } from '@brand/views/comps/MenuComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap/gsap-core';
import { MenuButton } from '@brand/views/comps/MenuButton';
import { appModel } from '@core/models/services/AppModelService';
import { PixResponsiveGraphics } from '@core/pixiwrapper/PixResponsiveGraphics';

export class MenuCompMobile extends MenuComp {
  private topbar: PixGraphics;
  private closeBtn: PixFancyButton;
  private menubg: PixSprite;
  constructor(config: any) {
    super(config);
    this.topbar = this.elementsList['topbar'];
    this.closeBtn = this.elementsList['closeBtn'];
    this.menubg = this.elementsList['menubg'];
    if (this.closeBtn) {
      this.closeBtn.onPress.connect(this.hideMenu.bind(this));
    }
    setTimeout(this.resizeView.bind(this), 500);
    const homeURL = appModel.getHomeURL?.();

    if (!homeURL && this.homeBtn) {
      this.removeChild(this.homeBtn);
    }
  }

  protected resizeView() {
    this.menubg.scale.set(1);
    this.menubg.height = UIUtil.getGameHeight();

    super.resizeView();

    this.getMenuButtons().forEach((btn) => {
      const menuBtn = btn as unknown as MenuButton;
      menuBtn.resizeView();
    });
    this.updateMenuLayout();
  }

  protected updateMenuLayout(): void {
    if (!this.topbar) {
      return;
    }
    const firstButton = this.getMenuButtons().find(Boolean) as any;
    const gap = firstButton?.height;
    const startY = this.topbar.y + this.topbar.height;
    this.layoutMenuButtons(startY, gap);
  }

  protected showMenu(event: any): void {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW, 0);
    this.x = -this.width;
    this.alpha = 1;
    this.visible = true;
    AnimationProxy.animateTween(this, { duration: 0.2, x: 0, ease: Sine.easeOut });
  }
  protected hideMenu(): void {
    AnimationProxy.animateTween(this, { duration: 0.2, x: -this.width, onComplete: this.onMenuHidden.bind(this) });
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
  }
  protected onMenuHidden(): void {
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU_MOBILE);
  }
}
