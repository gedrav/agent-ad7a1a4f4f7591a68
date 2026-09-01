import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class GameIdleStateCommand extends StateCommand {
  private readonly intervalId: any;
  private lineWinCounter: number = 0;
  public async execute(data: any = null) {
    super.execute(data);
    const remainingTime = appModel.getSpinRemainingTime();
    if (remainingTime > 0) {
      setTimeout(this.enableGame.bind(this), remainingTime);
    } else {
      this.enableGame();
    }
  }
  public enableGame(): void {
    console.log('enableGame', appModel.promoSpinInfo?.status, appModel.promoFSPopupShown);
    if (appModel.promoSpinInfo?.status === 'ACTIVE' && !appModel.promoFSPopupShown) {
      StateManager.goToState(STATES.CHECK_PROMOFS_TRIGGER_STATE);
      return;
    }
    WrapperProxy.postLifecycleEvent('GameIdle');
    EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.IDLE_STATE_ENTRY);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    const winData = appModel.getWinData();
    if (appModel.isCascadeGame()) {
      GameProxy.config.idleTimeoutId = setTimeout(() => {
        EventHandler.dispatchEvent(SlotEvents.SHOW_SYMBOL_IDLE_ANIMATION);
      }, 1000);
    } else if (winData?.length > 0) {
      if (GameProxy.config.checkToShowWinAfterFS) {
        GameProxy.config.checkToShowWinAfterFS = false;
        return;
      }
      this.lineWinCounter = 0;
      this.showLineWin();
      //this.intervalId = setInterval(this.showLineWin.bind(this), 8000);
    } else {
      GameProxy.config.idleTimeoutId = setTimeout(() => {
        EventHandler.dispatchEvent(SlotEvents.SHOW_SYMBOL_IDLE_ANIMATION);
      }, 1000);
    }
  }
  public doNextStep(data: any = null) {
    super.doNextStep(data);
    setTimeout(this.showLineWin.bind(this), 0);
  }

  protected showLineWin(): void {
    if (appModel.getIsFreeSpinsSession() && GameProxy.config.dontShowWinAfterFS) {
      return;
    }
    if (this.lineWinCounter >= 4) {
      EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
      return;
    }
    if (appModel.lineWinIndex >= appModel.getWinData().length - 1) {
      this.lineWinCounter++;
    }
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_LINE_WIN);
  }

  public async destroy(data: any = null): Promise<void> {
    super.destroy(data);
    clearInterval(this.intervalId);
  }
}

export const GameIdleState = new GameIdleStateCommand();
