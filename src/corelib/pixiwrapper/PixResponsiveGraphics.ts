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

  public updateHeight(ht: number): void {
    this.configData.height = ht;
    this.rebuild();
  }

  public updateWidth(wid: number): void {
    this.configData.width = wid;
    this.rebuild();
  }

  public resize(): void {
    this.rebuild();
  }

  private rebuild(): void {
    this.graphics.clear();
    this.graphics.destroy();
    this.graphics = null;
    const obj = this.configData;
    let wid = obj.width;
    let ht = obj.height;
    if (DeviceProxy.config.isDevice) {
      if (DeviceProxy.config.isPortrait) {
        if (obj.pWidth && obj.pHeight) {
          wid = obj.pWidth;
          ht = obj.pHeight;
        }
      } else {
        if (obj.lWidth && obj.lHeight) {
          wid = obj.lWidth;
          ht = obj.lHeight;
        }
      }
    }
    this.graphics = new PixGraphics().roundRect(obj.x, obj.y, wid, ht, obj.radius).fill(obj.color);
    this.addChild(this.graphics);
  }
}
