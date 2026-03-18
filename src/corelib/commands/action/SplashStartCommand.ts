import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { RequestFullscreenCommand } from './RequestFullscreenCommand';

class SplashStartCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.SPLASH_START_CLICKED);
    const isDesktop = DeviceProxy.config.isDesktop;

    if (isDesktop) {
      RequestFullscreenCommand.execute();
    }
  }
}

export const SplashStartCommand = new SplashStartCmd();
