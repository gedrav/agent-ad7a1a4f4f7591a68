import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export class ActionCommand {
  public execute(data: any = null, sender?: any): void {
    //Logger.log('ACTION : ' + this.constructor.name);
    if (!data?.customSound) {
      EventHandler.dispatchEvent('PLAY_GENERIC_BUTTON_SOUND');
    }
  }
}
