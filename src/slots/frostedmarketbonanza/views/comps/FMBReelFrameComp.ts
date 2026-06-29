import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class FMBReelFrameComp extends ReelFrameComp {
  private readonly reelFrameAnim: PixSpine;

  constructor(config: any) {
    super(config);
    this.reelFrameAnim = this.elementsList['reelFrameAnim'];
  }
}
