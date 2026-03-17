import { SlotMachineView } from '@core/views/slotmachine/SlotMachineView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class GameSlotMachineView extends SlotMachineView {
  private potAnim: PixSpine;
  constructor(config: any) {
    super(config);

    this.potAnim = this.slotReel.elementsList['potAnim'];
    EventHandler.addEventListener('SHOW_WILD_BLAST', this.showWildBlast.bind(this));
  }

  protected resizeComponents(): void {}

  protected showWildBlast(): void {
    const obj: any = {
      numberOfWilds: 2,
      symbolPositions: [
        [0, 2],
        [2, 1],
      ],
    };
  }
}
