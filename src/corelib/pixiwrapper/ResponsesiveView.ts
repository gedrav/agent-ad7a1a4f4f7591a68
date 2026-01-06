import { AppEvents } from '@core/events/AppEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixView } from '@core/pixiwrapper/PixView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class ResponsesiveView extends PixView {
  constructor(configData: any) {
    super(configData);
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.resizeView.bind(this));
    setTimeout(this.resizeView.bind(this), 0);
  }
  protected resizeView(): void {
    if (this.isDestroyed) {
      return;
    }
    UIUtil.adjustElement(this);
  }
}
