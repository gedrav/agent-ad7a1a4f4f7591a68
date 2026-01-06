import { AppEvents } from '@core/events/AppEvents';
import { UIUtil } from '../utils/UIUtilService';
import { PixView } from '@core/pixiwrapper/PixView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class ResponsesiveChildrenView extends PixView {
  constructor(configData: any) {
    super(configData);
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.resizeView.bind(this));
    setTimeout(this.resizeView.bind(this), 10);
  }

  protected resizeView(): void {
    if (this.isDestroyed) {
      return;
    }
    for (const p in this.elementsList) {
      UIUtil.adjustElement(this.elementsList[p]);
    }
    this.repositionView();
    UIUtil.adjustElement(this);
  }
  protected repositionView(): void {}
}
