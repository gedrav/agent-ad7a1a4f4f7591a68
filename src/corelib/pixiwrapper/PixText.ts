import { Text } from 'pixi.js';

export class PixText extends Text {
  set configData(value: any) {
    this._configData = value;
  }
  private _configData: any;
  public name: string;

  constructor(textData: any, configData: any) {
    super(textData);
    this.configData = {};
    // cloning
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
  }
  public get configData() {
    return this._configData;
  }

  public getWidth(): number {
    return this.width;
  }
  public getHeight(): number {
    return this.height;
  }
}
