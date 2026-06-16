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
import { BBSpinStartState } from '@core/commands/states/BBSpinStartState';
import { CheckFSState } from '@core/commands/states/CheckFSState';
import { EnterFreespinsState } from '@core/commands/states/EnterFreespinsState';
import { ExitFreespinsState } from '@core/commands/states/ExitFreespinsState';
import { FSSpinStartState } from '@core/commands/states/FSSpinStartState';
import { BookShowSpinWinState } from '@game/states/BookShowSpinWinState';
import { BookShowSymbolExpansionState } from '@game/states/BookShowSymbolExpansionState';
import { BookShowSymbolAfterExpansionState } from '@game/states/BookShowSymbolAfterExpansionState';
import { BOSEnterFreespinsState } from '@game/states/BOSEnterFreeSpinState';
import { ShowFSTransitionState } from '@game/states/ShowFSTransitionState';

export const STATES_CONFIG: any = [
  { name: STATES.CHECK_UNFINISHED_STATE, state: CheckUnfinishedState },

  { name: STATES.IDLE_STATE, state: GameIdleState },
  { name: STATES.SPIN_START_STATE, state: SpinStartState },
  { name: STATES.SPIN_RESPONSE_RECEIVED_STATE, state: SpinResponseReceivedState },
  { name: STATES.SPIN_STOPPED_STATE, state: SpinStoppedState },
  { name: STATES.SHOW_PRE_EXPANSION_WIN_STATE, state: BookShowSpinWinState },
  { name: STATES.SHOW_SYMBOL_EXPANSION_STATE, state: BookShowSymbolExpansionState },
  { name: STATES.SHOW_POST_EXPANSION_WIN_STATE, state: BookShowSymbolAfterExpansionState },

  { name: STATES.CHECK_FEATURE_STATE, state: CheckFeatureState },
  { name: STATES.COMPLETE_GAMEROUND_STATE, state: CompleteGameRoundState },

  { name: STATES.CHECK_AUTOSPIN_STATE, state: CheckAutoSpinState },
  { name: STATES.START_AUTOSPIN_STATE, state: StartAutoSpinState },

  { name: STATES.ENTER_FREESPINS_STATE, state: BOSEnterFreespinsState },
  { name: STATES.SHOW_TRANSITION_ANIM, state: ShowFSTransitionState },

  { name: STATES.FS_SPIN_START_STATE, state: FSSpinStartState },
  { name: STATES.CHECK_FS_STATE, state: CheckFSState },
  { name: STATES.EXIT_FREESPINS_STATE, state: ExitFreespinsState },

  { name: STATES.BB_SPIN_START_STATE, state: BBSpinStartState },
];
