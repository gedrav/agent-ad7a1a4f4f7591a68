import { StateManager } from '@core/states/StateManagerService';
import { StateCommand } from '../core/StateCommand';

// The beat between the feature opening and its first round. The base state has no intro screen
// and moves straight on; a game with one overrides showIntro() and releases the feature when the
// player confirms.
export class RespinIntroStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    this.showIntro(() => StateManager.next());
  }

  protected showIntro(onConfirm: () => void): void {
    onConfirm();
  }
}

export const RespinIntroState = new RespinIntroStateCommand();
