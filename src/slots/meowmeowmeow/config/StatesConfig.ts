import { STATES } from '@core/states/StateConstants';
import { CheckUnfinishedState } from '@core/commands/states/CheckUnfinishedState';
import { GameIdleState } from '@core/commands/states/GameIdleState';
import { SpinStartState } from '@core/commands/states/SpinStartState';
import { SpinResponseReceivedState } from '@core/commands/states/SpinResponseReceivedState';
import { SpinStoppedState } from '@core/commands/states/SpinStoppedState';
import { MeowPreSpinWinState } from '../states/MeowPreSpinWinState';
import { ShowSpinWinState } from '@core/commands/states/ShowSpinWinState';
import { CheckFeatureState } from '@core/commands/states/CheckFeatureState';
import { CheckAutoSpinState } from '@core/commands/states/CheckAutoSpinState';
import { StartAutoSpinState } from '@core/commands/states/StartAutoSpinState';
import { CompleteGameRoundState } from '@core/commands/states/CompleteGameRoundState';
import { BBSpinStartState } from '@core/commands/states/BBSpinStartState';
import { CheckFSState } from '@core/commands/states/CheckFSState';
import { EnterFreespinsState } from '@core/commands/states/EnterFreespinsState';
import { ExitFreespinsState } from '@core/commands/states/ExitFreespinsState';
import { FSSpinStartState } from '@core/commands/states/FSSpinStartState';
import { MMMCheckFeatureState } from '@slots/meowmeowmeow/states/MMMCheckFeatureState';
import { GreenEnterFreespinsState } from '@slots/meowmeowmeow/states/GreenEnterFreespinsState';
import { MMMCheckUnfinishedState } from '../states/MMMCheckUnfinishedState';
import { GAMESTATES } from '@slots/meowmeowmeow/states/GameStates';
import { WheelFeatureState } from '@slots/meowmeowmeow/states/WheelFeatureState';

export const STATES_CONFIG: any = [
  // { name: STATES.CHECK_UNFINISHED_STATE, state: CheckUnfinishedState },
  { name: STATES.CHECK_UNFINISHED_STATE, state: MMMCheckUnfinishedState },

  { name: STATES.IDLE_STATE, state: GameIdleState },
  { name: STATES.SPIN_START_STATE, state: SpinStartState },
  { name: STATES.SPIN_RESPONSE_RECEIVED_STATE, state: SpinResponseReceivedState },
  { name: STATES.SPIN_STOPPED_STATE, state: SpinStoppedState },
  { name: STATES.PRE_SPIN_WIN_STATE, state: MeowPreSpinWinState },
  { name: STATES.SHOW_SPIN_WIN_STATE, state: ShowSpinWinState },

  { name: STATES.CHECK_FEATURE_STATE, state: CheckFeatureState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.GAME_FEATURE_STATE, state: MMMCheckFeatureState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },

  { name: GAMESTATES.WHEEL_FEATURE_STATE, state: WheelFeatureState },
  { name: GAMESTATES.GREEN_ENTER_FREESPINS_STATE, state: GreenEnterFreespinsState },

  { name: STATES.ENTER_FREESPINS_STATE, state: EnterFreespinsState },

  { name: STATES.FS_SPIN_START_STATE, state: FSSpinStartState },
  { name: STATES.CHECK_FS_STATE, state: CheckFSState },
  { name: STATES.EXIT_FREESPINS_STATE, state: ExitFreespinsState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.BB_SPIN_START_STATE, state: BBSpinStartState },
];
