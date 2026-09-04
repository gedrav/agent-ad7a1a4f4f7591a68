import { SlotAppView } from '@core/views/containers/SlotAppView';

export class GameAppScreen extends SlotAppView {
  constructor(configData: any) {
    super(configData);

    // Keep the error popup above every other popup
    const messagePopupView = this.elementsList['messagePopupView'];
    if (messagePopupView) {
      this.sortableChildren = true;
      messagePopupView.zIndex = Number.MAX_SAFE_INTEGER;
    }
  }
}
