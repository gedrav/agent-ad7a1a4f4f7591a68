import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { UIUtil } from '@core/utils/UIUtilService';
import { AssetLoader } from '@core/models/services/AssetLoader';

export class BGView extends ResponsiveChildrenView {
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
    if (this.maingameBG.configData.freespinState) {
      this.currentBG = 'main';
      this.maingameBG.playAnimation({ state: this.maingameBG.configData.defaultState, loop: true });
      return;
    }
    if (this.currentBG === 'free' && this.freegameBG.configData.unload) {
      this.unloadFSBG();
    }
    this.currentBG = 'main';
    if (this.freegameBG) {
      this.freegameBG.visible = false;
    }
    this.maingameBG.visible = true;
  }
  protected showFreeGameBG() {
    if (this.maingameBG.configData.freespinState) {
      this.currentBG = 'free';
      this.maingameBG.playAnimation({ state: this.maingameBG.configData.freespinState, loop: true });
      return;
    }
    this.currentBG = 'free';
    if (this.freegameBG.configData.unload) {
      this.loadFSBG();
    }
    if (this.freegameBG) {
      this.freegameBG.visible = true;
    }
    this.maingameBG.visible = false;
  }
  protected async unloadFSBG() {
    if (this.freegameBG) {
      if (this.freegameBG.configData.spineName) {
        await AssetLoader.unloadAsset(this.freegameBG.configData.spineName);
      }
    }
  }
  async loadFSBG() {
    await AssetLoader.loadFeatures();
    this.freegameBG = this.elementsList['freegameBG'];
  }
}
