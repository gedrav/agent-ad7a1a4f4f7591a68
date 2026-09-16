import { STATES } from '@core/states/StateConstants';
import { CheckUnfinishedStateV2 } from '@core/commands/states/CheckUnfinishedStateV2';
import { GameIdleState } from '@core/commands/states/GameIdleState';
import { SpinStartState } from '@core/commands/states/SpinStartState';
import { JCSpinResponseReceivedState } from '../states/JCSpinResponseReceivedState';
import { SpinStoppedState } from '@core/commands/states/SpinStoppedState';
import { ShowSpinWinState } from '@core/commands/states/ShowSpinWinState';
import { CheckFeatureStateV2 } from '@core/commands/states/CheckFeatureStateV2';
import { CheckAutoSpinState } from '@core/commands/states/CheckAutoSpinState';
import { StartAutoSpinState } from '@core/commands/states/StartAutoSpinState';
import { CompleteGameRoundState } from '@core/commands/states/CompleteGameRoundState';
import { PreSpinWinState } from '@core/commands/states/PreSpinWinState';
import { GamePreWinState } from '../states/GamePreWinState';
import { EnterRespinState } from '../states/EnterRespinState';
import { RespinSpinStartState } from '../states/RespinSpinStartState';
import { CheckRespinState } from '../states/CheckRespinState';
import { ExitRespinState } from '../states/ExitRespinState';
import { CheckPromoFSTriggerState } from '@core/commands/states/CheckPromoFSTriggerState';
import { CheckPromoFSState } from '@core/commands/states/CheckPromoFSState';
import { ResumePromoFSState } from '@core/commands/states/ResumePromoFSState';
import { ExitPromoFSState } from '@core/commands/states/ExitPromoFSState';

export const STATES_CONFIG: any = [
  { name: STATES.CHECK_PROMOFS_TRIGGER_STATE, state: CheckPromoFSTriggerState },
  { name: STATES.CHECK_UNFINISHED_STATE, state: CheckUnfinishedStateV2 },

  { name: STATES.IDLE_STATE, state: GameIdleState },
  { name: STATES.SPIN_START_STATE, state: SpinStartState },
  { name: STATES.SPIN_RESPONSE_RECEIVED_STATE, state: JCSpinResponseReceivedState },
  { name: STATES.SPIN_STOPPED_STATE, state: SpinStoppedState },
  { name: STATES.PRE_SPIN_WIN_STATE, state: GamePreWinState },
  { name: STATES.SHOW_SPIN_WIN_STATE, state: ShowSpinWinState },

  { name: STATES.CHECK_FEATURE_STATE, state: CheckFeatureStateV2 },

  // Respin (Hold & Win) feature loop. ENTER_RESPIN_STATE must immediately follow
  // CHECK_FEATURE_STATE (its StateManager.next() lands here), and EXIT_RESPIN_STATE must
  // immediately precede COMPLETE_GAMEROUND_STATE (its StateManager.next() lands there) - see
  // EnterRespinState/ExitRespinState. RESPIN_SPIN_START_STATE and CHECK_RESPIN_STATE are only
  // ever reached via explicit goToState(), so their array position doesn't matter, but they're
  // kept here for readability.
  { name: STATES.ENTER_RESPIN_STATE, state: EnterRespinState },
  { name: STATES.RESPIN_SPIN_START_STATE, state: RespinSpinStartState },
  { name: STATES.CHECK_RESPIN_STATE, state: CheckRespinState },
  { name: STATES.EXIT_RESPIN_STATE, state: ExitRespinState },

  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.CHECK_PROMOFS_STATE, state: CheckPromoFSState },
  { name: STATES.RESUME_PROMOFS_STATE, state: ResumePromoFSState },
  { name: STATES.EXIT_PROMOFS_STATE, state: ExitPromoFSState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },
];
