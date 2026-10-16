import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { appModel } from '@core/models/services/AppModelService';

export class GameSlotMachineView extends SlotMachineView {
  private readonly leftFrame: any;
  constructor(configData: any) {
    super(configData);

    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.hidePaylineElement.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_LINE_WIN, this.hidePaylineElement.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_WINS, this.showPaylineElement.bind(this));

    this.leftFrame = this.elementsList['leftFrame'];

    UIUtil.addInteraction(this.leftFrame, () => {
      this.showPaylines();
    });
    UIUtil.setClickable(this.leftFrame, true);
  }

  protected showPaylines(): void {
    if (appModel.isBusy) return;
    this.leftFrame.visible = false;
    EventHandler.dispatchEvent(SlotEvents.SHOW_PAYLINES);
    setTimeout(() => {
      EventHandler.dispatchEvent(SlotEvents.HIDE_PAYLINES);
      this.leftFrame.visible = true;
    }, 2000);
  }

  protected hidePaylineElement(): void {
    this.leftFrame.visible = false;
  }

  protected showPaylineElement(): void {
    this.leftFrame.visible = true;
  }
}
