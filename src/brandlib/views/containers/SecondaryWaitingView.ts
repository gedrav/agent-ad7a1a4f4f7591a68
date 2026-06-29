import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Container, Graphics, Ticker } from 'pixi.js';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';

export class SecondaryWaitingView extends ResponsiveChildrenView {
  private readonly bg: PixSprite;
  private readonly ticker: Ticker;

  constructor(config) {
    super(config);
    this.visible = false;
    this.bg = this.elementsList['popupCont'].elementsList['bg'] as PixSprite;
    EventHandler.addEventListener(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN, this.showView.bind(this));
  }

  protected showView(): void {
    this.visible = true;
  }

  protected onSecondaryAssetsLoaded() {
    super.onSecondaryAssetsLoaded();
    if (appModel.waitingForFeature) {
      StateManager.executeAgain();
    }
    this.destroyView();
    this.destroy();
  }
}
