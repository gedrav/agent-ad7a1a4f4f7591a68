import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { BGView } from '@core/views/bg/BGView';
import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { ControlPanelView } from '@brand/views/containers/ControlPanelView';
import { TimerView } from '@core/views/containers/TimerView';
import { BetPanelView } from '@brand/views/popups/BetPanelView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AutoplayView } from '@brand/views/popups/AutoplayView';
import { SlotEvents } from '@core/events/SlotEvents';
import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { MessagePopupView } from '@brand/views/popups/MessagePopupView';
import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { MenuComp } from '@brand/views/comps/MenuComp';
import { MenuCompMobile } from '@brand/views/comps/MenuCompMobile';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class SlotAppView extends ResponsiveChildrenView {
  protected gameBGView: BGView;
  protected slotMachineView: SlotMachineView;
  protected controlPanelView: ControlPanelView;
  protected timerView: TimerView;
  protected betPanelView: BetPanelView;
  private autoplayView: AutoplayView;
  private buyBonusView: BuyBonusView;
  private messagePopupView: MessagePopupView;
  private popupComp: FSPopupComp;
  private menuComp: MenuComp;
  private menuCompM: MenuCompMobile;

  constructor(config) {
    super(config);
    this.gameBGView = this.elementsList['gameBGView'];
    this.slotMachineView = this.elementsList['slotMachineView'];
    this.controlPanelView = this.elementsList['controlPanelView'];
    this.timerView = this.elementsList['timerView'];
    this.betPanelView = this.elementsList['betPanelView'];
    this.removeChild(this.betPanelView);
    this.autoplayView = this.elementsList['autoplayView'];
    this.removeChild(this.autoplayView);
    this.buyBonusView = this.elementsList['buyBonusView'];
    this.removeChild(this.buyBonusView);
    this.messagePopupView = this.elementsList['messagePopupView'];
    this.removeChild(this.messagePopupView);
    this.popupComp = this.elementsList['popupComp'];
    this.removeChild(this.popupComp);
    this.menuComp = this.elementsList['menuComp'];
    this.removeChild(this.menuComp);
    this.menuCompM = this.elementsList['menuCompM'];
    this.removeChild(this.menuCompM);

    EventHandler.addEventListener(SlotEvents.SHOW_BET_PANEL, this.showBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_AUTO_PLAY_PANEL, this.showAutoPlayPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_BUY_BONUS_VIEW, this.showBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_MESSAGE_POPUP, this.showMessagePopup.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_FS_POPUP, this.showFSPopup.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MENU, this.hideMenu.bind(this));
    EventHandler.addEventListener(SlotEvents.MENU_CLICKED, this.onMenuClicked.bind(this));
  }
  protected hideMenu(): void {
    setTimeout(() => {
      if (DeviceProxy.config.isMobile) {
        this.removeChild(this.menuCompM);
      } else {
        this.removeChild(this.menuComp);
      }
    }, 200);
  }
  protected onMenuClicked(): void {
    if (DeviceProxy.config.isMobile) {
      this.addChild(this.menuCompM);
    } else {
      this.addChild(this.menuComp);
    }
  }
  protected showFSPopup(): void {
    this.addChild(this.popupComp);
  }
  protected showBetPanel(): void {
    this.addChild(this.betPanelView);
  }
  protected showAutoPlayPanel(): void {
    this.addChild(this.autoplayView);
  }
  protected showBuyBonusView(): void {
    this.addChild(this.buyBonusView);
  }
  protected showMessagePopup(data: any): void {
    this.addChild(this.messagePopupView);
  }
}
