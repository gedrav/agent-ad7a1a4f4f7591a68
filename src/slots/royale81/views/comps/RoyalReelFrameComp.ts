import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { GlowFilter } from 'pixi-filters';
import { GameProxy } from '@core/models/GameConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { CONSTANTS } from '@core/utils/CONSTANTS';

export class RoyalReelFrameComp extends ReelFrameComp {
  private reelFrameAnim: PixSpine;

  constructor(config: any) {
    super(config);
    this.reelFrameAnim = this.elementsList['reelFrameAnim'];
    EventHandler.addEventListener(SlotEvents.BIG_WIN_ANIM_COMPLETED, this.onBigWinCompleted.bind(this));
  }

  public showWin(): void {
    const winType = appModel.getWinType();
    if (winType == CONSTANTS.BELOW_TOTALBET_WIN) {
      return;
    }
    if (winType == CONSTANTS.STANDARD_WIN) {
      this.reelFrameAnim.playAnimation({ state: 'Small_Win', loop: false });
    } else {
      this.reelFrameAnim.playAnimation({ state: 'Big_Win', loop: true });
    }
  }
  protected onBigWinCompleted(): void {
    this.reelFrameAnim.playAnimation({ state: 'Static', loop: false });
  }
}
