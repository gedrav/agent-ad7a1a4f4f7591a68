import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StateManager } from '@core/states/StateManagerService';

export class GreenFeatureComp extends ResponsiveChildrenView {
  constructor(config: any) {
    super(config);
    this.visible = false;
    this.renderable = false;
    this.interactive = false;

    EventHandler.addEventListener('SHOW_GREEN_TRANSITION', this.onShowGreenFeature.bind(this));
  }

  private onShowGreenFeature(): void {
    const interfaceSize = Number(appModel.featureResult?.featureData?.interfaceSize) || 4;
    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', interfaceSize);
    StateManager.next();
  }
}
