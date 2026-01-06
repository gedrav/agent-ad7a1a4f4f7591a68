import { Cache } from 'pixi.js';
import { AbstractProxy } from '@core/models/AbstractProxy';

class GameConfigProxy extends AbstractProxy {
  private _config!: any;
  private _virtualConfig: any;
  private _symbolsData: any;

  public setGameConfig(config: any) {
    this._config = config;
    this.config.isTurboOn = false;
  }

  public updateConfigFromCommon(): void {
    this.config.environment = window.location.hostname;
    const cache = (Cache as any)._cache;
    const obj = cache.get('commonConfig.json');
    if (obj.gameConfig) {
      this.updateConfig(obj.gameConfig);
    }
    const data = obj.urls;
    const len = data.length;
    data.gameConfig = data['localhost'];
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        const obj = data[k];
        if (data[k].name.indexOf(this.config.environment) > -1) {
          data.gameConfig = data[k].config;
          break;
        }
      }
    }
    if (data.gameConfig) {
      this.updateConfig(data.gameConfig);
    }
  }
  public updateConfig(data: any): void {
    for (const p in data) {
      this._config[p] = data[p];
    }
  }

  public get config(): any {
    return this._config;
  }

  public setSymbolsData(data: any): void {
    this._symbolsData = data;
  }

  public get symbolsData(): any {
    return this._symbolsData;
  }
  get virtualConfig(): any {
    return this._virtualConfig;
  }

  set virtualConfig(value: any) {
    this._virtualConfig = value;
  }
}

export const GameProxy = new GameConfigProxy();
