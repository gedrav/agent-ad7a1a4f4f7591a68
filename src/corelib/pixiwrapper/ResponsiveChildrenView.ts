import { AppEvents } from '@core/events/AppEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixView } from '@core/pixiwrapper/PixView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class ResponsiveChildrenView extends PixView {
  private resizeHandler: () => void;

  constructor(configData: any) {
    super(configData);
  }
  protected onViewCreated() {
    super.onViewCreated();
    this.resizeHandler = this.resizeView.bind(this);
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.resizeHandler);
    setTimeout(this.resizeHandler, 10);
  }

  protected resizeView(): void {
    if (this.isDestroyed) {
      return;
    }
    if (!this.viewCreated) {
      return;
    }
    for (const p in this.elementsList) {
      UIUtil.adjustElement(this.elementsList[p]);
    }
    this.repositionView();
    UIUtil.adjustElement(this);
  }

  public destroyView(): void {
    // CRITICAL: Remove resize listener to prevent memory leak
    if (this.resizeHandler) {
      EventHandler.removeEventListener(AppEvents.APP_RESIZE, this.resizeHandler);
    }
    super.destroyView();
  }

  public async destroyElements(): Promise<void> {
    // CRITICAL: Remove resize listener to prevent memory leak
    if (this.resizeHandler) {
      EventHandler.removeEventListener(AppEvents.APP_RESIZE, this.resizeHandler);
    }
    await super.destroyElements();
  }

  protected repositionView(): void {}
}
