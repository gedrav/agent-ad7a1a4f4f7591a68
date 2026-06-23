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
import { GamePreWinState } from '@game/states/GamePreWinState';
import { BBSpinStartState } from '@core/commands/states/BBSpinStartState';
import { CheckFSState } from '@core/commands/states/CheckFSState';
import { CheckIsTumblePendingState } from '@core/commands/states/CheckIsTumblePendingState';
import { CheckToCollectMultiplierState } from '@core/commands/states/CheckToCollectMultiplierState';
import { EnterFreespinsState } from '@core/commands/states/EnterFreespinsState';
import { ExitFreespinsState } from '@core/commands/states/ExitFreespinsState';
import { FSSpinStartState } from '@core/commands/states/FSSpinStartState';
import { ShowCascadeState } from '@core/commands/states/ShowCascadeState';
import { ShowMultiplierCollectAnimState } from '@core/commands/states/ShowMultiplierCollectAnimState';
import { ShowTumbleState } from '@core/commands/states/ShowTumbleState';
import { ShowTumbleWinState } from '@core/commands/states/ShowTumbleWinState';

export const STATES_CONFIG: any = [
  { name: STATES.CHECK_UNFINISHED_STATE, state: CheckUnfinishedState },

  { name: STATES.IDLE_STATE, state: GameIdleState },
  { name: STATES.SPIN_START_STATE, state: SpinStartState },
  { name: STATES.SPIN_RESPONSE_RECEIVED_STATE, state: SpinResponseReceivedState },
  { name: STATES.SPIN_STOPPED_STATE, state: SpinStoppedState },
  { name: STATES.PRE_SPIN_WIN_STATE, state: GamePreWinState },
  { name: STATES.SHOW_TUMBLE_WIN_STATE, state: ShowTumbleWinState },
  { name: STATES.CHECK_IS_TUMBLE_PENDING, state: CheckIsTumblePendingState },
  { name: STATES.SHOW_TUMBLE_STATE, state: ShowTumbleState },
  { name: STATES.SHOW_CASCADE_STATE, state: ShowCascadeState },

  { name: STATES.CHECK_TO_COLLECT_MULTIPLIER, state: CheckToCollectMultiplierState },
  { name: STATES.SHOW_MULTIPLIER_COLLECT_ANIM_STATE, state: ShowMultiplierCollectAnimState },

  { name: STATES.SHOW_SPIN_WIN_STATE, state: ShowSpinWinState },

  { name: STATES.CHECK_FEATURE_STATE, state: CheckFeatureState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },

  { name: STATES.ENTER_FREESPINS_STATE, state: EnterFreespinsState },
  { name: STATES.FS_SPIN_START_STATE, state: FSSpinStartState },
  { name: STATES.CHECK_FS_STATE, state: CheckFSState },
  { name: STATES.EXIT_FREESPINS_STATE, state: ExitFreespinsState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.BB_SPIN_START_STATE, state: BBSpinStartState },
];
