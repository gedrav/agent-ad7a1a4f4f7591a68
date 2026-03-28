import { STATES } from '@core/states/StateConstants';
import { CheckUnfinishedState } from '@core/commands/states/CheckUnfinishedState';
import { GameIdleState } from '@core/commands/states/GameIdleState';
import { SpinStartState } from '@core/commands/states/SpinStartState';
import { SpinResponseReceivedState } from '@core/commands/states/SpinResponseReceivedState';
import { SpinStoppedState } from '@core/commands/states/SpinStoppedState';
import { ShowSpinWinState } from '@core/commands/states/ShowSpinWinState';
import { CheckFeatureState } from '@core/commands/states/CheckFeatureState';
import { CheckAutoSpinState } from '@core/commands/states/CheckAutoSpinState';
import { StartAutoSpinState } from '@core/commands/states/StartAutoSpinState';
import { CompleteGameRoundState } from '@core/commands/states/CompleteGameRoundState';
import { PreSpinWinState } from '@core/commands/states/PreSpinWinState';
import { GamePreWinState } from '@game/states/GamePreWinState';

export const STATES_CONFIG: any = [
  { name: STATES.CHECK_UNFINISHED_STATE, state: CheckUnfinishedState },

  { name: STATES.IDLE_STATE, state: GameIdleState },
  { name: STATES.SPIN_START_STATE, state: SpinStartState },
  { name: STATES.SPIN_RESPONSE_RECEIVED_STATE, state: SpinResponseReceivedState },
  { name: STATES.SPIN_STOPPED_STATE, state: SpinStoppedState },
  { name: STATES.PRE_SPIN_WIN_STATE, state: GamePreWinState },
  { name: STATES.SHOW_SPIN_WIN_STATE, state: ShowSpinWinState },

  { name: STATES.CHECK_FEATURE_STATE, state: CheckFeatureState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },
];
