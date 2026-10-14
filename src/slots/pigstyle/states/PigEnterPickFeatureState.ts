import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class PigEnterPickFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PICK_FEATURE_ENTRY_SOUND);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_FS_TOTALWIN);
    appModel.startFreeSpinsSession(true);
    appModel.setFeatureTriggered();
    EventHandler.dispatchEvent(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, false);
    EventHandler.dispatchEvent(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, true);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);

    if (appModel.getIsUnfinishedGame()) {
      this.doNextStep();
      return;
    }

    EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_POPUP);
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    WrapperProxy.postLifecycleEvent('GameBusy', { reason: 'free_spins' });
    EventHandler.dispatchEvent(SlotEvents.HIDE_MAINGAME_ELEMENTS);
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_START);
    EventHandler.dispatchEvent(SlotEvents.STOP_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_BG_SOUND);
    StateManager.goToState(STATES.SHOW_FS_ENTRY_TRANSITION_ANIM);
  }
}

export const PigEnterPickFeatureState = new PigEnterPickFeatureStateCommand();
