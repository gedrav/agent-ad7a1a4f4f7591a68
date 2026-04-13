import { AppEvents } from '@core/events/AppEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixView } from '@core/pixiwrapper/PixView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class ResponsiveChildrenView extends PixView {
  constructor(configData: any) {
    super(configData);
  }
  protected onViewCreated() {
    super.onViewCreated();
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.resizeView.bind(this));
    setTimeout(this.resizeView.bind(this), 10);
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
  protected repositionView(): void {}
}
