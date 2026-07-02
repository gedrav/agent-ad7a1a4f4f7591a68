import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';

class LoggerService {
  constructor() {}

  public log(str: string): void {
    if (import.meta.env.VITE_GAME_CONSOLE_ACTIVE === 'true') {
      console.log(Util.getCurrentTime(), ' :: ' + str);
    }
  }
  trace(str: string): void {
    if (import.meta.env.VITE_GAME_CONSOLE_ACTIVE === 'true') {
      console.trace(str);
    }
  }
  warn(str: string) {
    if (import.meta.env.VITE_GAME_CONSOLE_ACTIVE === 'true') {
      console.warn(str);
    }
  }
  clear() {
    console.clear();
  }
  logObj(obj: any, message: string = ''): void {
    if (import.meta.env.VITE_GAME_CONSOLE_ACTIVE === 'true') {
      console.log(message + '', obj);
    }
  }
}

export const Logger = new LoggerService();
