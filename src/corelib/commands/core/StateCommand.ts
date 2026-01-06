import { Logger } from '@core/utils/LoggerService';

export class StateCommand {
  public async execute(data: any = null) {
    Logger.log('STATE : ' + this.constructor.name);
  }
  public doNextStep(data: any = null): void {}

  public async destroy(data: any = null) {}
}
