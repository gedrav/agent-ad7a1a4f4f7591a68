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
import { EnterRespinState } from '../states/EnterRespinState';
import { RespinIntroState } from '../states/RespinIntroState';
import { RespinSpinStartState } from '../states/RespinSpinStartState';
import { RespinPreWinState } from '@core/commands/states/RespinPreWinState';
import { CheckRespinState } from '@core/commands/states/CheckRespinState';
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
  { name: STATES.SHOW_SPIN_WIN_STATE, state: ShowSpinWinState },

  { name: STATES.CHECK_FEATURE_STATE, state: CheckFeatureStateV2 },
  { name: STATES.ENTER_RESPIN_STATE, state: EnterRespinState },
  { name: STATES.RESPIN_INTRO_STATE, state: RespinIntroState },
  { name: STATES.RESPIN_SPIN_START_STATE, state: RespinSpinStartState },
  { name: STATES.RESPIN_PRE_WIN_STATE, state: RespinPreWinState },
  { name: STATES.CHECK_RESPIN_STATE, state: CheckRespinState },
  { name: STATES.EXIT_RESPIN_STATE, state: ExitRespinState },

  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.CHECK_PROMOFS_STATE, state: CheckPromoFSState },
  { name: STATES.RESUME_PROMOFS_STATE, state: ResumePromoFSState },
  { name: STATES.EXIT_PROMOFS_STATE, state: ExitPromoFSState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },
];
