import { BGView } from '@core/views/bg/BGView';

export class GameBGView extends BGView {
  constructor(config: any) {
    super(config);
  }

  protected showFreeGameBG() {
    this.currentBG = 'free';
  }

  protected showMainGameBG() {
    super.showMainGameBG();
  }
}
