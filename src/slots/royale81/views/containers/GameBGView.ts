import { BGView } from '@core/views/bg/BGView';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

export class GameBGView extends BGView {
  constructor(config: any) {
    super(config);
    this.maingameBG = this.elementsList['maingameBG'];
  }

  protected resizeView() {
    if (DeviceProxy.config.isDevice) {
      if (DeviceProxy.config.isPortrait) {
        this.maingameBG?.setSkin('Portrait');
      } else {
        this.maingameBG?.setSkin('Landscape');
      }
    }
    super.resizeView();
  }
}
