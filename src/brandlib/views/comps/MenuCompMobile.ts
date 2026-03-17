import { MenuComp } from '@brand/views/comps/MenuComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap/gsap-core';

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
  }

  protected resizeView() {
    this.menubg.scale.set(1);
    this.menubg.height = UIUtil.getGameHeight();

    super.resizeView();

    const btns: string[] = [
      'homeBtn',
      'soundOnBtn',
      'soundOffBtn',
      'transactionHistoryBtn',
      'infoBtn',
      'gameHistoryBtn',
      'depositBtn',
      'promotionBtn',
    ];
    const len = btns.length;
    this.elementsList['homeBtn'].scale.set(1);
    for (let i = 0; i < len; i++) {
      const btn = this.elementsList[btns[i]];
      btn.resizeView();
      if (i == 0) {
        btn.y = this.topbar.y + this.topbar.height;
      }
      if (i > 0) {
        btn.y = this.elementsList[btns[i - 1]].y + btn.height;
      }
      if (i == 2) {
        btn.y = this.elementsList[btns[i - 1]].y;
      }
    }
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
