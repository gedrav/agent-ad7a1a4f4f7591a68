import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';

class LoggerService {
  constructor() {}

  public log(str: string): void {
    if (GameProxy.config.isConsoleActive) {
      console.log(Util.getCurrentTime(), ' :: ' + str);
    }
  }
  trace(str: string): void {
    if (GameProxy.config.isConsoleActive) {
      console.trace(str);
    }
  }
  warn(str: string) {
    if (GameProxy.config.isConsoleActive) {
      console.warn(str);
    }
  }
  clear() {
    console.clear();
  }
  logObj(obj: any, message: string = ''): void {
    if (GameProxy.config.isConsoleActive) {
      console.log(message + '', obj);
    }
  }
}

export const Logger = new LoggerService();
