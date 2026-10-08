import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';

export class GameReelFrameComp extends ReelFrameComp {
  private readonly _mainSprites: PixSprite[] = [];
  private readonly _freeSprites: PixSprite[] = [];

  constructor(config: any) {
    super(config);

    const pairs: [string, string][] = [['reelFrame', 'reelFrameFG']];
    for (const [mainKey, freeKey] of pairs) {
      const m = this.elementsList[mainKey] as PixSprite;
      const f = this.elementsList[freeKey] as PixSprite;
      if (m) this._mainSprites.push(m);
      if (f) this._freeSprites.push(f);
    }

    EventHandler.addEventListener(SlotEvents.SHOW_MAINGAME_BG, this._applyMainGameFrame.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_FREEGAME_BG, this._applyFreeGameFrame.bind(this));

    if (appModel.getIsFreeSpinsSession()) {
      this._applyFreeGameFrame();
    } else {
      this._applyMainGameFrame();
    }
  }

  private _applyMainGameFrame(): void {
    this._mainSprites.forEach((s) => (s.visible = true));
    this._freeSprites.forEach((s) => (s.visible = false));
  }

  private _applyFreeGameFrame(): void {
    this._mainSprites.forEach((s) => (s.visible = false));
    this._freeSprites.forEach((s) => (s.visible = true));
  }
}
