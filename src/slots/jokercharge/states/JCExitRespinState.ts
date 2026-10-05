import { ExitRespinStateCommand } from '@core/commands/states/ExitRespinState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '../events/JCEvents';
import { TotalWinPanelData } from '../views/comps/LogoComp';
import { TotalWinCollectData } from '../views/slot/GameSlotMachineView';

class JCExitRespinStateCommand extends ExitRespinStateCommand {
  // Mirrors EnterRespinState - the wipe hides the swap back, which also clears respinActive so
  // the next settle takes the normal pipeline instead of CheckRespinState. The closing beats are
  // awaited first, or the wipe would cover them before they could be read.
  protected async closeFeature(onSwap: () => void): Promise<void> {
    await this.showTotalWinPanel();
    await this.playTotalWinCollect();
    await this.presentTotalWinPanel();
    EventHandler.dispatchEvent(JCEvents.PLAY_TRANSITION, {
      onHalfway: () => {
        EventHandler.dispatchEvent(JCEvents.SET_BONUS_TRIGGER_LAYOUT, { active: false });
        onSwap();
      },
    });
  }

  // Resolves once the panel has finished showing, or straight away if nothing is listening.
  private showTotalWinPanel(): Promise<void> {
    return new Promise((resolve) => {
      const request: TotalWinPanelData = { hold: false, onComplete: () => resolve() };
      EventHandler.dispatchEvent(JCEvents.SHOW_TOTAL_WIN_PANEL, request);
      if (!request.hold) resolve();
    });
  }

  // Resolves once the panel has hidden itself, or straight away if there was no panel up.
  private presentTotalWinPanel(): Promise<void> {
    return new Promise((resolve) => {
      const request: TotalWinPanelData = { hold: false, onComplete: () => resolve() };
      EventHandler.dispatchEvent(JCEvents.PRESENT_TOTAL_WIN_PANEL, request);
      if (!request.hold) resolve();
    });
  }

  // Resolves once the last cell has been paid into the panel.
  private playTotalWinCollect(): Promise<void> {
    return new Promise((resolve) => {
      const request: TotalWinCollectData = { hold: false, onComplete: () => resolve() };
      EventHandler.dispatchEvent(JCEvents.PLAY_TOTAL_WIN_COLLECT, request);
      if (!request.hold) resolve();
    });
  }
}

export const ExitRespinState = new JCExitRespinStateCommand();
