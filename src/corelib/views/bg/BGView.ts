import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class BGView extends ResponsesiveChildrenView {
  protected maingameBG: PixSprite | PixSpine;
  protected freegameBG: PixSprite | PixSpine;
  protected currentBG: string;
  constructor(config: any) {
    super(config);
    this.maingameBG = this.elementsList['maingameBG'];
    this.freegameBG = this.elementsList['freegameBG'];
    if (this.freegameBG) {
      this.freegameBG.visible = false;
    }
    this.currentBG = 'main';
    EventHandler.addEventListener(SlotEvents.SHOW_MAINGAME_BG, this.showMainGameBG.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_FREEGAME_BG, this.showFreeGameBG.bind(this));
    this.showMainGameBG();
  }
  protected showMainGameBG() {
    this.currentBG = 'main';
    if (this.freegameBG) {
      this.freegameBG.visible = false;
    }
    this.maingameBG.visible = true;
  }
  protected showFreeGameBG() {
    this.currentBG = 'free';
    if (this.freegameBG) {
      this.freegameBG.visible = true;
    }
    this.maingameBG.visible = false;
  }
}
