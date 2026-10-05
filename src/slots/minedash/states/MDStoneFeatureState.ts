import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Util } from '@core/utils/UtilService';

class MDStoneFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    const firedStone = appModel.getReelModifiers()?.find((m: any) => m.type === 'stoneFired');

    if (!firedStone) {
      StateManager.next();
      return;
    }

    switch (firedStone.stone) {
      case 'wildsStone':
        if (firedStone.positions && firedStone.positions.length > 0) {
          EventHandler.dispatchEvent('EXPAND_WILD', firedStone.positions);
        } else {
          StateManager.next();
        }
        break;

      case 'mysteryStone':
        EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, {
          title: Util.getContent('mysteryHeading') || 'MYSTERY',
          tickerValue: firedStone.value ?? 0,
          callbackFunction: () => StateManager.doNextStep(),
        });
        break;

      case 'multiStone':
        if (appModel.gameResult) {
          appModel.gameResult.spinWin = appModel.gameResult.totalWin;
        }
        EventHandler.dispatchEvent('SHOW_MULTI_WIN', firedStone);
        break;

      case 'megawinStone':
        if (firedStone.positions && firedStone.positions.length > 0) {
          EventHandler.dispatchEvent('SHOW_MEGA_WIN', {
            positions: firedStone.positions,
            symbol: firedStone.value,
            triggerPosition: firedStone.triggerPosition,
          });
        } else {
          StateManager.next();
        }
        break;

      default:
        StateManager.next();
        break;
    }
  }

  public doNextStep(data: any = null): void {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const MDStoneFeatureState = new MDStoneFeatureStateCommand();
