import { Texture } from 'pixi.js';
import { PixGraphics } from '../pixiwrapper/PixGraphics';
import { PixSpine } from '../pixiwrapper/PixSpine';
import { PixSprite } from '../pixiwrapper/PixSprite';
declare class UIUtilService {
  getElement(obj: any): any;
  getRectangle(width: number, height: number, colour: number, x?: number, y?: number): PixGraphics;
  getRoundedRectangle(obj: any): PixGraphics;
  getCircle(fill: number, radius: number): PixGraphics;
  getBorderRectangle(
    width: number,
    height: number,
    backgroundColor: number,
    borderColor: number,
    borderWidth: number,
    x?: number,
    y?: number,
  ): PixGraphics;
  getTextField(tobj: any): any;
  protected getTextProp(stylename: string): any;
  getSprite(name: string, data: any): PixSprite;
  getSpriteFromTexture(texture: Texture): PixSprite;
  getTexture(name: string): Texture;
  getSpineAnim(name: string, obj: any): PixSpine;
  setPosition(obj: any, x: number, y: number): void;
  setPositionX(obj: any, x: number): void;
  setPositionY(obj: any, y: number): void;
  stopPropagation(element: any): void;
  adjustElement(element: any): void;
  positionElement(element: any, layout: any): void;
  alignHorizontal(element: any, layout: any): void;
  alignVertical(element: any, layout?: any): void;
  scaleElement(element: any, layout: any): void;
  doFullScreen(element: any): void;
  getGameWidth(): any;
  getGameHeight(): any;
  protected getDeviceSpecificLayout(data: any): any;
  destroyView(view: any, cleanUp?: boolean): void;
}
export declare const UIUtil: UIUtilService;
export {};
