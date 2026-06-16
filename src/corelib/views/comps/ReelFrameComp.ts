import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class ReelFrameComp extends StandardView {
  protected reelFrame: PixSprite;
  protected reelFrameFS: PixSprite;
  constructor(config) {
    super(config);
    this.reelFrame = this.elementsList['reelFrame'];
    this.reelFrameFS = this.elementsList['reelFrameFS'];
    EventHandler.addEventListener(SlotEvents.SHOW_MAINGAME_BG, this.showMainGameReel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_FREEGAME_BG, this.showFreeGameReel.bind(this));
  }
  protected showMainGameReel(): void {
    if (this.reelFrame) this.reelFrame.visible = true;
    if (this.reelFrameFS) {
      this.reelFrameFS.visible = false;
    }
  }
  protected showFreeGameReel(): void {
    if (this.reelFrameFS) {
      this.reelFrame.visible = false;
      this.reelFrameFS.visible = true;
    }
  }

  public showWin(): void {}
}
