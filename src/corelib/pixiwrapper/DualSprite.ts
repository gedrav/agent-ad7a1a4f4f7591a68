import { PixView } from '@core/pixiwrapper/PixView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class DualSprite extends PixView {
  private portraitBG: PixSprite;
  private landscapeBG: PixSprite;

  constructor(config: any) {
    super(config);
    this.portraitBG = UIUtil.getSprite(this.configData.image + '_P');
    this.landscapeBG = UIUtil.getSprite(this.configData.image);
    this.portraitBG.visible = false;

    this.addChild(this.portraitBG, this.landscapeBG);

    this.resizeComponents();
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.resizeComponents.bind(this));
  }

  protected resizeComponents(): void {
    if (this.isDestroyed) {
      return;
    }
    this.portraitBG.visible = DeviceProxy.config.isPortrait;
    this.landscapeBG.visible = !DeviceProxy.config.isPortrait;
  }
}
