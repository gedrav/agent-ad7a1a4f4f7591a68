import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class GameSlotMachineView extends SlotMachineView {
  private readonly leftFrame: any;
  constructor(configData: any) {
    super(configData);

    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.hidePaylineElement.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_LINE_WIN, this.hidePaylineElement.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_WINS, this.showPyalineElement.bind(this));

    this.leftFrame = this.elementsList['leftFrame'];
  }

  protected hidePaylineElement(): void {
    this.leftFrame.visible = false;
  }

  protected showPyalineElement(): void {
    this.leftFrame.visible = true;
  }
}
