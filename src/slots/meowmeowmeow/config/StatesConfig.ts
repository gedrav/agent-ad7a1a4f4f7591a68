import { STATES } from '@core/states/StateConstants';
import { GameIdleState } from '@core/commands/states/GameIdleState';
import { SpinStartState } from '@core/commands/states/SpinStartState';
import { SpinResponseReceivedState } from '@core/commands/states/SpinResponseReceivedState';
import { SpinStoppedState } from '@core/commands/states/SpinStoppedState';
import { MeowPreSpinWinState } from '../states/MeowPreSpinWinState';
import { ShowSpinWinState } from '@core/commands/states/ShowSpinWinState';
import { CheckAutoSpinState } from '@core/commands/states/CheckAutoSpinState';
import { StartAutoSpinState } from '@core/commands/states/StartAutoSpinState';
import { CompleteGameRoundState } from '@core/commands/states/CompleteGameRoundState';
import { BBSpinStartState } from '@core/commands/states/BBSpinStartState';
import { CheckFSState } from '@core/commands/states/CheckFSState';
import { EnterFreespinsState } from '@core/commands/states/EnterFreespinsState';
import { ExitFreespinsState } from '@core/commands/states/ExitFreespinsState';
import { FSSpinStartState } from '@core/commands/states/FSSpinStartState';
import { CheckFeatureStateV2 } from '@core/commands/states/CheckFeatureStateV2';
import { CheckUnfinishedStateV2 } from '@core/commands/states/CheckUnfinishedStateV2';
import { EnterPickFeatureState } from '@core/commands/states/EnterPickFeatureState';
import { PickFeatureState } from '@core/commands/states/PickFeatureState';
import { ExitPickFeatureState } from '@core/commands/states/ExitPickFeatureState';
import { GreenEnterTransitionState } from '@slots/meowmeowmeow/states/GreenEnterTransitionState';
import { GreenExitTransitionState } from '@slots/meowmeowmeow/states/GreenExitTransitionState';

export const STATES_CONFIG: any = [
  { name: STATES.CHECK_UNFINISHED_STATE_V2, state: CheckUnfinishedStateV2 },

  { name: STATES.IDLE_STATE, state: GameIdleState },
  { name: STATES.SPIN_START_STATE, state: SpinStartState },
  { name: STATES.SPIN_RESPONSE_RECEIVED_STATE, state: SpinResponseReceivedState },
  { name: STATES.SPIN_STOPPED_STATE, state: SpinStoppedState },
  { name: STATES.PRE_SPIN_WIN_STATE, state: MeowPreSpinWinState },
  { name: STATES.SHOW_SPIN_WIN_STATE, state: ShowSpinWinState },

  { name: STATES.CHECK_FEATURE_STATE_V2, state: CheckFeatureStateV2 },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },

  { name: STATES.ENTER_FREESPINS_STATE, state: EnterFreespinsState },
  { name: STATES.SHOW_FS_ENTRY_TRANSITION_ANIM, state: GreenEnterTransitionState },
  { name: STATES.FS_SPIN_START_STATE, state: FSSpinStartState },
  { name: STATES.CHECK_FS_STATE, state: CheckFSState },
  { name: STATES.SHOW_FS_EXIT_TRANSITION_ANIM, state: GreenExitTransitionState },
  { name: STATES.EXIT_FREESPINS_STATE, state: ExitFreespinsState },

  { name: STATES.ENTER_PICK_FEATURE_STATE, state: EnterPickFeatureState },
  { name: STATES.PICK_FEATURE_STATE, state: PickFeatureState },
  { name: STATES.EXIT_PICK_FEATURE_STATE, state: ExitPickFeatureState },

  { name: STATES.BB_SPIN_START_STATE, state: BBSpinStartState },
];
