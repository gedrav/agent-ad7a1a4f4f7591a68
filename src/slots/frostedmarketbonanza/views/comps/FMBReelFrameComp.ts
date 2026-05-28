import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class FMBReelFrameComp extends ReelFrameComp {
  private reelFrameAnim: PixSpine;

  constructor(config: any) {
    super(config);
    this.reelFrameAnim = this.elementsList['reelFrameAnim'];
    EventHandler.addEventListener(SlotEvents.NUDGE_FEATURE_ACTIVATED, this.playNudgeReelLoop.bind(this));
    EventHandler.addEventListener(SlotEvents.NUDGE_COMPLETED, this.playIdleLoop.bind(this));
  }

  public playNudgeReelLoop(): void {
    //todo: change animation once spine fixes
    this.reelFrameAnim.playAnimation({ state: 'animation', loop: true });
  }

  public playIdleLoop(): void {
    this.reelFrameAnim.playAnimation({ state: 'animation', loop: true });
  }
}
