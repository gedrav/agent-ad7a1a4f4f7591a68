import { Logger } from '@core/utils/LoggerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class StateCommand {
  public async execute(data: any = null) {
    if (DeviceProxy.getIsLocal()) {
      Logger.log('STATE : ' + this.constructor.name);
    }
  }
  public doNextStep(data: any = null): void {}

  public async destroy(data: any = null) {}
}
