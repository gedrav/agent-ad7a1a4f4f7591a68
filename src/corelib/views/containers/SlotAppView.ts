import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
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

export class SlotAppView extends ResponsesiveChildrenView {
  protected gameBGView: BGView;
  protected slotMachineView: SlotMachineView;
  protected controlPanelView: ControlPanelView;
  protected timerView: TimerView;
  protected betPanelView: BetPanelView;
  private autoplayView: AutoplayView;
  private buyBonusView: BuyBonusView;
  private messagePopupView: MessagePopupView;
  private popupComp: FSPopupComp;

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

    EventHandler.addEventListener(SlotEvents.SHOW_BET_PANEL, this.showBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_AUTO_PLAY_PANEL, this.showAutoPlayPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_BUY_BONUS_VIEW, this.showBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_MESSAGE_POPUP, this.showMessagePopup.bind(this));
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
