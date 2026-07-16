import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateCommand } from '@core/commands/core/StateCommand';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';
import { CompleteGameRoundState } from '@core/commands/states/CompleteGameRoundState';

class WheelFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent('showWheel');
  }
}

export const WheelFeatureState = new WheelFeatureStateCommand();
