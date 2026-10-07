import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

export function canShowJackpot(): boolean {
  if (!appModel.jackpotRound) return false;
  // getStateIndex falls back to state 0 for unknown names, so check registration first
  if (StateManager.states?.some((s) => s.name === STATES.SHOW_JACKPOT_GAME_STATE)) return true;
  console.warn('Jackpot round pending but SHOW_JACKPOT_GAME_STATE is not registered, skipping jackpot flow');
  appModel.jackpotRound = null;
  appModel.unfreezeJackpotMeters();
  return false;
}

export function getPostJackpotState(): string {
  return appModel.getIsPromoFSSession() ? STATES.CHECK_PROMOFS_STATE : STATES.CHECK_AUTOSPIN_STATE;
}
