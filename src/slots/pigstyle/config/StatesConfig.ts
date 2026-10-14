import { STATES } from '@core/states/StateConstants';
import { GameIdleState } from '@core/commands/states/GameIdleState';
import { SpinStartState } from '@core/commands/states/SpinStartState';
import { SpinResponseReceivedState } from '@core/commands/states/SpinResponseReceivedState';
import { SpinStoppedState } from '@core/commands/states/SpinStoppedState';
import { ShowSpinWinState } from '@core/commands/states/ShowSpinWinState';
import { CheckAutoSpinState } from '@core/commands/states/CheckAutoSpinState';
import { StartAutoSpinState } from '@core/commands/states/StartAutoSpinState';
import { CompleteGameRoundState } from '@core/commands/states/CompleteGameRoundState';
import { BBSpinStartState } from '@core/commands/states/BBSpinStartState';
import { CheckFSState } from '@core/commands/states/CheckFSState';
import { EnterFreespinsState } from '@core/commands/states/EnterFreespinsState';
import { FSSpinStartState } from '@core/commands/states/FSSpinStartState';
import { PigCheckUnfinishedState } from '@game/states/PigCheckUnfinishedState';
import { PigCheckFeatureState } from '@game/states/PigCheckFeatureState';
import { PigEnterPickFeatureState } from '@game/states/PigEnterPickFeatureState';
import { ShowFSEnterTransitionState } from '@game/states/ShowFSEnterTransitionState';
import { ShowFSExitTransitionState } from '@game/states/ShowFSExitTransitionState';
import { CheckPromoFSTriggerState } from '@core/commands/states/CheckPromoFSTriggerState';
import { CheckPromoFSState } from '@core/commands/states/CheckPromoFSState';
import { ResumePromoFSState } from '@core/commands/states/ResumePromoFSState';
import { ExitPromoFSState } from '@core/commands/states/ExitPromoFSState';
import { PigExitFreespinsState } from '@game/states/PigExitFreespinsStateCommand';

export const STATES_CONFIG: any = [
  { name: STATES.CHECK_PROMOFS_TRIGGER_STATE, state: CheckPromoFSTriggerState },
  { name: STATES.CHECK_UNFINISHED_STATE, state: PigCheckUnfinishedState },

  { name: STATES.IDLE_STATE, state: GameIdleState },
  { name: STATES.SPIN_START_STATE, state: SpinStartState },
  { name: STATES.SPIN_RESPONSE_RECEIVED_STATE, state: SpinResponseReceivedState },
  { name: STATES.SPIN_STOPPED_STATE, state: SpinStoppedState },
  { name: STATES.SHOW_SPIN_WIN_STATE, state: ShowSpinWinState },

  { name: STATES.CHECK_FEATURE_STATE_V2, state: PigCheckFeatureState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.CHECK_PROMOFS_STATE, state: CheckPromoFSState },
  { name: STATES.RESUME_PROMOFS_STATE, state: ResumePromoFSState },
  { name: STATES.EXIT_PROMOFS_STATE, state: ExitPromoFSState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },

  { name: STATES.ENTER_PICK_FEATURE_STATE, state: PigEnterPickFeatureState },
  { name: STATES.ENTER_FREESPINS_STATE, state: EnterFreespinsState },
  { name: STATES.SHOW_FS_ENTRY_TRANSITION_ANIM, state: ShowFSEnterTransitionState },
  { name: STATES.FS_SPIN_START_STATE, state: FSSpinStartState },
  { name: STATES.CHECK_FS_STATE, state: CheckFSState },
  { name: STATES.EXIT_FREESPINS_STATE, state: PigExitFreespinsState },
  { name: STATES.SHOW_FS_EXIT_TRANSITION_ANIM, state: ShowFSExitTransitionState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.BB_SPIN_START_STATE, state: BBSpinStartState },
];
