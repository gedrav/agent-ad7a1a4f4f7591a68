import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { appModel } from '@core/models/services/AppModelService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class GameSlotMachineView extends SlotMachineView {
  constructor(config: any) {
    super(config);
  }
}
