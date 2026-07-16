import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { SlotEvents } from '@core/events/SlotEvents';

export class GreenFeatureComp extends ResponsiveChildrenView {
  constructor(config: any) {
    super(config);
    this.visible = false;
    this.renderable = false;
    this.interactive = false;

    EventHandler.addEventListener('showGreenFeature', this.onShowGreenFeature.bind(this));
  }

  private onShowGreenFeature(): void {
    const interfaceSize = Number(appModel.featureResult?.interfaceSize) || 4;
    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', interfaceSize);

    if (appModel.getIsUnfinishedFreespins()) {
      EventHandler.dispatchEvent(SlotEvents.RENDER_UNFINISHED_REEL);
    }

    StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
  }
}
