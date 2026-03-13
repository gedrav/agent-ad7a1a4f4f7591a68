import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';

export class MenuComp extends ResponsiveChildrenView {
  private menuBg: PixSprite;
  private homeBtn: PixFancyButton;
  private soundOnBtn: PixFancyButton;
  private soundOffBtn: PixFancyButton;
  private infoBtn: PixFancyButton;
  private gameHistoryBtn: PixFancyButton;

  private transactionHistoryBtn: PixFancyButton;

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
    if (this.soundOffBtn) {
      this.soundOffBtn.visible = false;
    }
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SOUND_STATE_CHANGED, this.onSoundStateChanged.bind(this));

    EventHandler.addEventListener(SlotEvents.HIDE_MENU, this.hideMenu.bind(this));
    EventHandler.addEventListener(SlotEvents.MENU_CLICKED, this.showMenu.bind(this));
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
  }
}
