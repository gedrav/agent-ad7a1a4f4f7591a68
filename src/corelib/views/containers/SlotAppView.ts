import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { BGView } from '@core/views/bg/BGView';
import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { ControlPanelView } from '@brand/views/containers/ControlPanelView';
import { TimerView } from '@core/views/containers/TimerView';
import { BetPanelView } from '@brand/views/popups/BetPanelView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class SlotAppView extends ResponsesiveChildrenView {
  protected gameBGView: BGView;
  protected slotMachineView: SlotMachineView;
  protected controlPanelView: ControlPanelView;
  protected timerView: TimerView;
  protected betPanelView: BetPanelView;

  constructor(config) {
    super(config);
    this.gameBGView = this.elementsList['gameBGView'];
    this.slotMachineView = this.elementsList['slotMachineView'];
    this.controlPanelView = this.elementsList['controlPanelView'];
    this.timerView = this.elementsList['timerView'];
    this.betPanelView = this.elementsList['betPanelView'];
  }
}
