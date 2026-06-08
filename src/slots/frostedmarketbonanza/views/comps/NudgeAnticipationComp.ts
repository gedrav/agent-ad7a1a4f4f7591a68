import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

// --- tunables ---
const ANTICIPATION_DURATION = 200; // how long the Loop plays before the Slide + symbol drop
const REEL_STAGGER = 400; // delay between two consecutive reels starting their sequence

export class NudgeAnticipationComp extends StandardView {
  private anticipationSpines: PixSpine[] = [];

  constructor(config: any) {
    super(config);
    this.collectSpines();
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.NUDGE_FEATURE_ACTIVATED, this.showAnticipation.bind(this));
    EventHandler.addEventListener(SlotEvents.NUDGE_REEL_SETTLED, this.hideReel.bind(this));
    EventHandler.addEventListener(SlotEvents.NUDGE_COMPLETED, this.hideAnticipation.bind(this));
  }

  private collectSpines(): void {
    this.anticipationSpines = [];
    for (let i = 1; ; i++) {
      const spine = this.elementsList[`nudgeAnticipation${i}`] as PixSpine;
      if (!spine) break;
      spine.visible = false;
      this.anticipationSpines.push(spine);
    }
  }

  private showAnticipation(): void {
    const result = appModel.getReelModifiersData();
    const nudgedReelIndices: number[][] = result?.nudgedReelIndices ?? [];
    const nudgeReels = [...new Set(nudgedReelIndices.map((pair) => pair[0]))];
    if (!nudgeReels.length) return;
    this.visible = true;
    nudgeReels.forEach((reel, order) => this.runReelSequence(reel, order * REEL_STAGGER));
  }

  private async runReelSequence(reel: number, startDelay: number): Promise<void> {
    const spine = this.anticipationSpines[reel];
    if (!spine) return;
    if (startDelay) await Util.addDelays(startDelay);
    spine.visible = true;
    spine.playAnimation({ state: 'Loop', loop: true });
    await Util.addDelays(ANTICIPATION_DURATION);
    EventHandler.dispatchEvent(SlotEvents.NUDGE_REEL_DROP, reel);
    spine.playAnimation({ state: 'Slide', loop: false });
  }

  private hideReel(reel: number): void {
    const spine = this.anticipationSpines[reel];
    if (!spine) return;
    spine.stopAnimation();
    spine.visible = false;
  }

  private hideAnticipation(): void {
    for (const spine of this.anticipationSpines) {
      spine.stopAnimation();
      spine.visible = false;
    }
    this.visible = false;
  }
}
