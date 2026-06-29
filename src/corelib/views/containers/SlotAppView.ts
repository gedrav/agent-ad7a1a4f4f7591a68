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
import { BuyBonusViewMobile } from '@brand/views/popups/BuyBonusViewMobile';
import { ModalView } from '@core/views/containers/ModalView';
import { GameProxy } from '@core/models/GameConfigProxy';

export class SlotAppView extends ResponsiveChildrenView {
  protected gameBGView: BGView;
  protected slotMachineView: SlotMachineView;
  protected controlPanelView: ControlPanelView;
  protected timerView: TimerView;
  protected betPanelView: BetPanelView;
  private readonly autoplayView: AutoplayView;
  private readonly buyBonusView: BuyBonusView | BuyBonusViewMobile;
  private readonly messagePopupView: MessagePopupView;
  private readonly popupComp: FSPopupComp;
  private readonly menuComp: MenuComp | MenuCompMobile;
  private readonly modalView: ModalView;

  constructor(config) {
    super(config);
    this.gameBGView = this.elementsList['gameBGView'];
    this.slotMachineView = this.elementsList['slotMachineView'];
    this.controlPanelView = this.elementsList['controlPanelView'];
    if (this.controlPanelView) {
      this.controlPanelView.slotView = this.slotMachineView;
    }

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
    this.modalView = this.elementsList['modalView'];
    this.removeChild(this.modalView);

    EventHandler.addEventListener(SlotEvents.SHOW_BET_PANEL, this.showBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_AUTO_PLAY_PANEL, this.showAutoPlayPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_BUY_BONUS_VIEW, this.showBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_MESSAGE_POPUP, this.showMessagePopup.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_FS_POPUP, this.showFSPopup.bind(this));
    EventHandler.addEventListener(SlotEvents.MENU_CLICKED, this.onMenuClicked.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_MODAL_VIEW, this.showModalView.bind(this));

    EventHandler.addEventListener(SlotEvents.HIDE_MENU, this.hideAllViews.bind(this));
    EventHandler.addEventListener(SlotEvents.MODAL_VIEW_CLICKED, this.onModalViewClicked.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BUY_BONUS_VIEW, this.hideAllViews.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BET_PANEL, this.hideAllViews.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_CANCEL_CLICKED, this.hideAllViews.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_MENU_MOBILE, this.hideAllViews.bind(this));
  }
  protected onModalViewClicked(): void {
    if (this.popupComp?.parent || this.messagePopupView?.parent) {
      return;
    }
    this.hideAllViews();
    GameProxy.config.isPopupOpened = false;
  }
  protected hideAllViews(): void {
    this.removeChild(this.betPanelView);
    this.removeChild(this.autoplayView);
    this.removeChild(this.buyBonusView);
    this.removeChild(this.messagePopupView);
    this.removeChild(this.popupComp);
    this.removeChild(this.menuComp);
    this.removeChild(this.modalView);
  }
  protected showModalView(): void {
    this.addChild(this.modalView);
  }
  protected hideMenu(): void {
    setTimeout(() => {
      this.removeChild(this.menuComp);
    }, 200);
  }
  protected onMenuClicked(): void {
    this.addChild(this.menuComp);
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
    EventHandler.dispatchEvent(SlotEvents.PLAY_GENERIC_MSG_POPUP_SOUND);
    this.addChild(this.messagePopupView);
  }
}
