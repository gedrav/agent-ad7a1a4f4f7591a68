import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { RequestFullscreenCommand } from './RequestFullscreenCommand';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class SplashStartCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    WrapperProxy.postActivityEvent('ingame_casino_play');
    EventHandler.dispatchEvent(SlotEvents.SPLASH_START_CLICKED);
    const isDesktop = DeviceProxy.config.isDesktop;
    const isTablet = DeviceProxy.config.isTablet;

    if (!isDesktop && !isTablet) {
      RequestFullscreenCommand.execute();
    }
  }
}

export const SplashStartCommand = new SplashStartCmd();
