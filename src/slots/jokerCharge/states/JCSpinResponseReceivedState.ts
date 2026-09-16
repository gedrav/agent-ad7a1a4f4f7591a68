import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { JCEvents } from '../events/JCEvents';
import { isRespinActive } from '../models/JCLinesState';

// Replaces corelib's SpinResponseReceivedState: that class hands the response off to SlotReel (via
// STOP_SPIN_AFTER_RESPONSE), but JokerCharge's grid is driven by HoldNWinReelsContainer instead,
// which has no corelib SlotReel to hand off to. Keeps the same shared UI bookkeeping corelib's
// version does, but replaces the SlotReel hand-off with the real backend grid instead.
class JCSpinResponseReceivedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.SHOW_STOPSPIN_BUTTON);
    EventHandler.dispatchEvent(SlotEvents.MULTIPLIER_SET_TO_LEVEL, 1); // reset multiplier to lvl1 after each spin
    if (appModel.getIsPromoFSSession()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_COUNT);
    }

    // Column-major (grid[column][row]), matching HoldNWinReelsContainer.stopSpin()'s convention.
    const grid: string[][] = appModel.getSpinResult()?.grid;
    EventHandler.dispatchEvent(JCEvents.SPIN_RESULT_RECEIVED, grid);
  }

  // Fires once HoldNWinReelsContainer reports every reel settled (see its stopSpin() onComplete),
  // not right after execute() - mirrors corelib's SpinResponseReceivedState.doNextStep().
  //
  // Mid-respin, this reuses the same SPIN_RESPONSE_RECEIVED_STATE slot (see RespinSpinStartState)
  // rather than a dedicated one, so route the settle onward here: a respin round has no paylines
  // to present, so it skips straight to CheckRespinState instead of the normal SpinStoppedState/
  // GamePreWinState/ShowSpinWinState pipeline (and keeps the spin button hidden throughout, same
  // as a freespins session).
  //
  // Keyed off isRespinActive() - set once EnterRespinState has actually run - and NOT off
  // appModel.featureResult.featureType: corelib's storeSpinResult() already fills featureResult
  // from the base spin that *triggers* the feature, so checking the type here would skip the
  // CheckFeatureStateV2 -> EnterRespinState intro entirely and jump straight into the loop.
  public doNextStep(data: any = null) {
    super.doNextStep(data);
    if (isRespinActive()) {
      StateManager.goToState(STATES.CHECK_RESPIN_STATE);
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_BUTTON);
    StateManager.next();
  }
}

export const JCSpinResponseReceivedState = new JCSpinResponseReceivedStateCommand();
