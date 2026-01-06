import { AbstractProxy } from './AbstractProxy';
declare class GameConfigProxy extends AbstractProxy {
  private _config;
  setGameConfig(config: any): void;
  updateConfig(data: any): void;
  get config(): any;
}
export declare const GameProxy: GameConfigProxy;
export {};
