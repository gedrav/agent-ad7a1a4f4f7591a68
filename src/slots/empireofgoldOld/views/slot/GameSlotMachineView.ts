import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import SlotReelTumble from '@core/views/slotmachine/SlotReelTumble';

export class GameSlotMachineView extends SlotMachineView {
  protected tumbleSlotReel: SlotReelTumble;
  constructor(config: any) {
    super(config);
    this.tumbleSlotReel = this.elementsList['slotReel'];
    EventHandler.addEventListener(SlotEvents.SHOW_TUMBLE_WIN, this.showTumbleWin.bind(this));
  }

  protected showSpinWin(): void {
    this.bigWinsComp.showSpinWin();
  }

  protected showTumbleWin(): void {
    this.tumbleSlotReel.showTumbleWin();
    this.bigWinsComp.showTumbleWin();
  }
}
