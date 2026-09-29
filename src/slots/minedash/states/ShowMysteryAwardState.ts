import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Util } from '@core/utils/UtilService';

class ShowMysteryAwardStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const firedStone = appModel.getReelModifiers()?.find((m: any) => m.type === 'stoneFired');
    if (firedStone?.stone === 'mysteryStone') {
      EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, {
        title: Util.getContent('mysteryHeading') || 'MYSTERY',
        tickerValue: firedStone.value ?? 0,
        callbackFunction: () => StateManager.doNextStep(),
      });
    } else {
      StateManager.next();
    }
  }

  public doNextStep(data: any = null): void {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const ShowMysteryAwardState = new ShowMysteryAwardStateCommand();
