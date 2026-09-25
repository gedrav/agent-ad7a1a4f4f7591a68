import { RespinSpinStartStateCommand } from '@core/commands/states/RespinSpinStartState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { Clock } from '@core/utils/Clock';
import { JCEvents } from '../events/JCEvents';
import { registerRespinRound } from '../models/JCRespinState';

// Lets the round that just settled be read before the reels move again.
const ROUND_GAP = 500;

class JCRespinSpinStartStateCommand extends RespinSpinStartStateCommand {
  protected async beforeSpin(): Promise<void> {
    await Clock.wait(ROUND_GAP);
    // Judges the round that just finished, so the counter moves as this spin starts.
    const remaining = registerRespinRound(appModel.featureResult?.holdField?.length ?? 0);
    EventHandler.dispatchEvent(JCEvents.UPDATE_RESPIN_COUNTER, remaining);
  }
}

export const RespinSpinStartState = new JCRespinSpinStartStateCommand();
