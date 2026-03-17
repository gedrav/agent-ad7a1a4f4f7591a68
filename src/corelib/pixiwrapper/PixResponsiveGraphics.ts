import * as PIXI from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class PixResponsiveGraphics extends ResponsiveView {
  private graphics: PixGraphics;
  constructor(obj: any) {
    super(obj);
    this.graphics = new PixGraphics().roundRect(obj.x, obj.y, obj.width, obj.height, obj.radius).fill(obj.color);
    this.addChild(this.graphics);
  }

  public resize(): void {
    this.graphics.clear();
    this.graphics.destroy();
    this.graphics = null;
    const obj = this.configData;
    if (DeviceProxy.config.isDevice) {
      if (DeviceProxy.config.isPortrait) {
        this.graphics = new PixGraphics().roundRect(obj.x, obj.y, obj.pWidth, obj.pHeight, obj.radius).fill(obj.color);
        this.addChild(this.graphics);
      } else {
        this.graphics = new PixGraphics().roundRect(obj.x, obj.y, obj.lWidth, obj.lHeight, obj.radius).fill(obj.color);
        this.addChild(this.graphics);
      }
    } else {
      this.graphics.roundRect(obj.x, obj.y, obj.width, obj.height, obj.radius).fill(obj.color);
    }
  }
}
