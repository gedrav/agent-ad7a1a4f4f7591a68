import { AppEvents } from '@core/events/AppEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixView } from '@core/pixiwrapper/PixView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class ResponsiveView extends PixView {
  private resizeHandler: () => void;

  constructor(configData: any) {
    super(configData);
    this.resizeHandler = this.resizeView.bind(this);
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.resizeHandler);
    setTimeout(this.resizeHandler, 0);
  }
  protected resizeView(): void {
    if (this.isDestroyed) {
      return;
    }
    UIUtil.adjustElement(this);
  }

  public destroyView(): void {
    // CRITICAL: Remove event listener to prevent memory leaks
    EventHandler.removeEventListener(AppEvents.APP_RESIZE, this.resizeHandler);
    super.destroyView();
  }
}
