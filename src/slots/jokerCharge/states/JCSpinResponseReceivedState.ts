import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { JCEvents } from '../events/JCEvents';
import { isRespinActive } from '../models/JCLinesState';
import { SpinResultPayload } from '../views/slot/HoldNWinReelsContainer';

// Replaces corelib's SpinResponseReceivedState, which hands off to a SlotReel this game doesn't
// have - the grid goes to HoldNWinReelsContainer instead. Shared UI bookkeeping is kept as-is.
class JCSpinResponseReceivedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.SHOW_STOPSPIN_BUTTON);
    EventHandler.dispatchEvent(SlotEvents.MULTIPLIER_SET_TO_LEVEL, 1); // reset multiplier to lvl1 after each spin
    if (appModel.getIsPromoFSSession()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_COUNT);
    }

    EventHandler.dispatchEvent(JCEvents.SPIN_RESULT_RECEIVED, this.resolveSpinResult());
    EventHandler.dispatchEvent(JCEvents.TOP_REEL_RESULT_RECEIVED, this.resolveModifierRow());
  }

  // Only the respin response carries this; BonusReelsContainer ignores it outside the feature.
  private resolveModifierRow(): string[] | undefined {
    return appModel.featureResult?.modifierRow ?? appModel.getSpinResult()?.modifierRow;
  }

  // A respin response carries no spinResults, so corelib nulls gameResult and its top-level
  // result.grid never gets stored - the collected cells arrive as featureResult.holdField instead.
  // The container turns whichever of the two shows up into a grid.
  private resolveSpinResult(): SpinResultPayload {
    return {
      grid: appModel.getSpinResult()?.grid,
      holdField: appModel.featureResult?.holdField,
    };
  }

  // Fires once every reel has settled, not right after execute(). Respin rounds reuse this same
  // state slot, so they're routed onward here - into RespinPreWinState, skipping the base game's
  // win-presentation pipeline they have no paylines for.
  //
  // Keyed off isRespinActive() and NOT featureResult.featureType: corelib fills featureResult from
  // the base spin that *triggers* the feature, so the type would already match before
  // EnterRespinState has run and would skip the intro entirely.
  public doNextStep(data: any = null) {
    super.doNextStep(data);
    if (isRespinActive()) {
      StateManager.goToState(STATES.RESPIN_PRE_WIN_STATE);
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_BUTTON);
    StateManager.next();
  }
}

export const JCSpinResponseReceivedState = new JCSpinResponseReceivedStateCommand();
