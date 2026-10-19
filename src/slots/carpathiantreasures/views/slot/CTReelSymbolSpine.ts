import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

export const WIN_FRAME_SHOW_EVENT = 'CT_WIN_FRAME_SHOW';
export const WIN_FRAME_HIDE_EVENT = 'CT_WIN_FRAME_HIDE';

export default class CTReelSymbolSpine extends ReelSymbolSpine {
  public showWinning(onComplete?: () => void, loop: boolean = false): void {
    super.showWinning(onComplete, loop);
    if (appModel.secondaryAssetsLoaded) {
      EventHandler.dispatchEvent(WIN_FRAME_SHOW_EVENT, this);
    }
  }

  protected destroySpine(): void {
    EventHandler.dispatchEvent(WIN_FRAME_HIDE_EVENT, this);
    super.destroySpine();
  }
}
