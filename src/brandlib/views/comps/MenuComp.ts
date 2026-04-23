import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';

export class MenuComp extends ResponsiveChildrenView {
  protected menuBg: PixSprite;
  protected homeBtn: PixFancyButton;
  protected soundOnBtn: PixFancyButton;
  protected soundOffBtn: PixFancyButton;
  protected infoBtn: PixFancyButton;
  protected gameHistoryBtn: PixFancyButton;
  protected showSplashBtn: PixFancyButton;
  protected hideSplashBtn: PixFancyButton;

  protected transactionHistoryBtn: PixFancyButton;

  constructor(config: any) {
    super(config);
    this.guideRect = this.elementsList['guideRect'];
    this.menuBg = this.elementsList['menubg'];

    this.homeBtn = this.elementsList['homeBtn'];
    this.soundOnBtn = this.elementsList['soundOnBtn'];
    this.soundOffBtn = this.elementsList['soundOffBtn'];
    this.transactionHistoryBtn = this.elementsList['transactionHistoryBtn'];
    this.infoBtn = this.elementsList['infoBtn'];
    this.gameHistoryBtn = this.elementsList['gameHistoryBtn'];
    this.showSplashBtn = this.elementsList['showSplashBtn'];
    this.hideSplashBtn = this.elementsList['hideSplashBtn'];

    if (this.soundOffBtn) {
      this.soundOffBtn.visible = false;
    }

    const homeURL = appModel.getHomeURL?.();

    if (!homeURL && this.homeBtn) {
      this.homeBtn.visible = false;
    }
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SOUND_STATE_CHANGED, this.onSoundStateChanged.bind(this));
    this.onSoundStateChanged(appModel.getPreferences().sound);

    EventHandler.addEventListener(SlotEvents.SHOW_INTRO_STATE_CHANGED, this.onShowIntroStateChanged.bind(this));
    this.onShowIntroStateChanged(appModel.getPreferences().showIntro);

    EventHandler.addEventListener(SlotEvents.HIDE_MENU, this.hideMenu.bind(this));
    EventHandler.addEventListener(SlotEvents.MENU_CLICKED, this.showMenu.bind(this));
    this.updateMenuLayout();
  }
  protected hideMenu(): void {
    AnimationProxy.fadeOut(this, 0.1, this.onMenuHidden.bind(this));
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU_MOBILE);
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
  }
  protected onMenuHidden(): void {}
  protected showMenu(event: any): void {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW, 0);
    AnimationProxy.fadeIn(this, 0.1);
  }

  private onSoundStateChanged(flag: boolean): void {
    this.soundOnBtn.visible = flag;
    this.soundOffBtn.visible = !flag;

    this.updateMenuLayout();
  }

  private onShowIntroStateChanged(showIntro: boolean): void {
    if (this.showSplashBtn) this.showSplashBtn.visible = !showIntro;
    if (this.hideSplashBtn) this.hideSplashBtn.visible = showIntro;

    this.updateMenuLayout();
  }

  protected getMenuButtons(): any[] {
    return [
      this.homeBtn,
      this.soundOnBtn,
      this.soundOffBtn,
      this.infoBtn,
      this.gameHistoryBtn,
      this.transactionHistoryBtn,
      this.showSplashBtn,
      this.hideSplashBtn,
    ].filter(Boolean);
  }

  protected getVisibleMenuButtons(): any[] {
    return this.getMenuButtons().filter((btn) => btn.visible);
  }

  protected layoutMenuButtons(startY: number, gap: number): any[] {
    const visibleButtons = this.getVisibleMenuButtons();

    visibleButtons.forEach((btn, index) => {
      btn.y = startY + index * gap;
    });

    return visibleButtons;
  }

  protected updateMenuLayout(): void {
    const startY = this.homeBtn?.y ?? 48;
    const gap = 96;
    const visibleButtons = this.layoutMenuButtons(startY, gap);

    if (this.menuBg) {
      const verticalPadding = 32;
      this.menuBg.height = visibleButtons.length > 0 ? visibleButtons.length * gap + verticalPadding : verticalPadding;
    }
  }
}
