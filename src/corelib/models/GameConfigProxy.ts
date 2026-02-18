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
    const cache = (Cache as any)._cache;
    const obj = cache.get('commonConfig.json');
    if (obj.gameConfig) {
      this.updateConfig(obj.gameConfig);
    }
    // URL config is driven by env vars (VITE_API_URL etc.) set at build time.
    // commonConfig.json no longer owns URL values.
    const urlConfig = {
      baseURL: import.meta.env.VITE_API_URL,
      socketURL: import.meta.env.VITE_SOCKET_URL,
      externalURL: import.meta.env.VITE_EXTERNAL_URL,
      historyURL: import.meta.env.VITE_HISTORY_URL,
      historyAPIURL: import.meta.env.VITE_HISTORY_API_URL,
    };
    this.updateConfig(urlConfig);
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
