import * as PIXI from 'pixi.js';
import {
  AnimatedSprite,
  Assets,
  Container,
  FillGradient,
  Graphics,
  Mesh,
  NineSliceSprite,
  PointData,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from 'pixi.js';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { ContentProxy } from '@core/models/ContentServiceProxy';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { GameProxy } from '@core/models/GameConfigProxy';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { Util } from './UtilService';
import { PixAnimatedSprite } from '@core/pixiwrapper/PixAnimatedSprite';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixText } from '@core/pixiwrapper/PixText';
import { GlowFilter, GrayscaleFilter } from 'pixi-filters';
import { appModel } from '@core/models/services/AppModelService';
import { PixBMPText } from '@core/pixiwrapper/PixBMPText';
import { DualSprite } from '@core/pixiwrapper/DualSprite';
import { PixIconFancyButton } from '@core/pixiwrapper/PixIconFancyButton';
import { PixDynamicSprite } from '@core/pixiwrapper/PixDynamicSprite';
import { PixSlider } from '@core/pixiwrapper/PixSlider';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixHTMLText } from '@core/pixiwrapper/PixHTMLText';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { PixResponsiveGraphics } from '@core/pixiwrapper/PixResponsiveGraphics';
import { Input } from '@pixi/ui';
import { PixNineSpliceSprite } from '@core/pixiwrapper/PixNineSpliceSprite';

const minMobileWidth: number = 44;
const minMobileHeight: number = 44;
const desktopWidth: number = 2424;
const desktopHeight: number = 1300;
class UIUtilService {
  public getElement(obj: any): any {
    let element: any = null;
    //console.log("Get element == ", obj);
    switch (obj.type) {
      case 'Graphics':
        element = this.getRectangle(obj.width, obj.height, obj.color, 0, 0, obj.name);
        element.configData = obj;
        break;
      case 'Rectangle':
        element = this.getRectangle(obj.width, obj.height, obj.color);
        element.configData = obj;
        break;
      case 'RoundedRectangle':
        element = this.getRoundedRectangle(obj);
        element.configData = obj;
        break;
      case 'ResponsiveGraphics':
        element = this.getResponsiveGraphics(obj);
        break;
      case 'Circle':
        element = this.getCircle(obj.color, obj.radius);
        element.configData = obj;
        break;
      case 'Arc':
        element = this.getArc(obj.centerX, obj.centerY, obj.radius, obj.startAngle, obj.endAngle, obj.fill);
        element.configData = obj;
        break;
      case 'Polygon':
        element = this.getPolygon(obj.points, obj.fill, obj.close);
        element.configData = obj;
        break;
      case 'BorderRectangle':
        element = this.getBorderRectangle(
          obj.width,
          obj.height,
          obj.backgroundColor,
          obj.borderColor,
          obj.borderWidth,
          obj.x,
          obj.y,
        );
        break;
      case 'BorderRoundedRectangle':
        element = this.getBorderRoundedRectangle(
          obj.width,
          obj.height,
          obj.backgroundColor,
          obj.borderColor,
          obj.borderWidth,
          obj.radius,
          obj.alpha,
        );
        break;
      case 'Container':
        element = this.getContainer(obj);
        break;
      case 'ResponsiveContainer':
        element = new ResponsiveView(obj);
        break;
      case 'ResponsiveChildrenContainer':
        element = new ResponsiveChildrenView(obj);
        break;
      case 'Text':
        element = this.getText(obj);
        break;
      case 'HTMLText':
        element = this.getHTMLText(obj);
        break;
      case 'BitmapText':
        element = this.getBitmapText(obj);
        break;
      case 'Image':
        element = this.getSprite(obj.image, obj);
        break;
      case 'Sprite':
        element = this.getSprite(obj.image, obj);
        break;
      case 'NineSliceSprite':
        element = this.getNineSliceSprite(obj.image, obj);
        break;
      case 'DualSprite':
        element = this.getDualSprite(obj);
        break;
      case 'PixDynamicSprite':
        element = this.getDynamicSprite(obj);
        break;
      case 'Spine':
        element = this.getSpineAnim(obj.spineName, obj);
        break;
      case 'AnimatedSprite':
        element = this.getAnimatedSprite(obj.animation, obj);
        break;
      case 'Button':
        element = this.getFancyButton(obj);
        break;
      case 'GraphicsButton':
        element = this.getGraphicsButton(obj);
        break;
      case 'Slider':
        element = this.getSlider(obj);
        break;
      case 'Input':
        element = this.getInput(obj);
        break;
      case 'PixToggleButton':
        element = this.getPixToggleButton(obj);
        break;
      case 'Comp':
        element = new obj.class(obj);
        break;
      default:
        break;
    }
    element.label = obj.name;
    if (obj.x) {
      this.setPositionX(element, obj.x);
    }
    if (obj.y) {
      this.setPositionY(element, obj.y);
    }
    if (DeviceProxy.config.isDevice) {
      if (obj.mx != undefined) {
        this.setPositionX(element, obj.mx);
      }
      if (obj.my != undefined) {
        this.setPositionY(element, obj.my);
      }
    }
    if (obj.alpha != undefined) {
      element.alpha = obj.alpha;
    }

    if (obj.scale) {
      if (typeof obj.scale === 'object') {
        if (obj.scale.x != undefined) {
          element.scale.x = obj.scale.x;
        }
        if (obj.scale.y != undefined) {
          element.scale.y = obj.scale.y;
        }
      } else {
        element.scale.set(obj.scale);
      }
    }
    if (DeviceProxy.config.isDevice) {
      if (obj.mScale) {
        element.scale.set(obj.mScale);
      }
    }
    if (obj.tint != undefined) {
      element.tint = obj.tint;
    }

    if (obj.anchor && element.anchor) {
      element.anchor.set(obj.anchor.x, obj.anchor.y);
    }
    if (obj.rotation) {
      element.rotation = Util.getRadians(obj.rotation);
    }
    if (obj.skewX) {
      element.skew.x = obj.skewX;
    }
    if (obj.skewY) {
      element.skew.y = obj.skewY;
    }
    if (obj.visible != undefined) {
      element.visible = obj.visible;
    }
    if (obj.tint != undefined) {
      element.tint = obj.tint;
    }
    return element;
  }
  public getDynamicSprite(data: any = null): PixDynamicSprite {
    const sp = new PixDynamicSprite(data);
    return sp;
  }

  public getIconFancyButton(obj: any): PixIconFancyButton {
    const options: any = obj.options;
    if (obj.textConfig) {
      options.text = this.getText(JSON.parse(JSON.stringify(obj.textConfig)));
    }
    const btn: PixIconFancyButton = new PixIconFancyButton(options, obj);
    btn.anchor.set(0.5);
    btn.enabled = true;
    return btn;
  }
  public getPixToggleButton(obj: any): PixToggleButton | null {
    const options: any = obj.options;
    if (obj.textConfig) {
      options.text = this.getText(JSON.parse(JSON.stringify(obj.textConfig)));
    }
    const btn: PixToggleButton = new PixToggleButton(options, obj);
    btn.anchor.set(0.5);
    btn.enabled = true;
    btn.updateTextPos();

    return btn;
  }

  public getGraphicsButton(obj: any): PixFancyButton {
    const options: any = {};
    if (obj.textConfig) {
      options.text = this.getText(Util.deepClone(obj.textConfig));
    }
    options.defaultView = UIUtil.getRoundedRectangle({
      width: obj.graphics.width,
      height: obj.graphics.height,
      radius: obj.graphics.radius,
      color: obj.graphics.color,
    });
    options.hoverView = UIUtil.getRoundedRectangle({
      width: obj.graphics.width,
      height: obj.graphics.height,
      radius: obj.graphics.radius,
      color: obj.graphics.hoverColor ? obj.graphics.hoverColor : obj.graphics.color,
    });
    options.pressedView = UIUtil.getRoundedRectangle({
      width: obj.graphics.width,
      height: obj.graphics.height,
      radius: obj.graphics.radius,
      color: obj.graphics.pressedColor ? obj.graphics.pressedColor : obj.graphics.color,
    });
    options.disabledView = UIUtil.getRoundedRectangle({
      width: obj.graphics.width,
      height: obj.graphics.height,
      radius: obj.graphics.radius,
      color: obj.graphics.disabledColor ? obj.graphics.disabledColor : obj.graphics.color,
    });
    options.animations = obj.animations;

    const btn: PixFancyButton = new PixFancyButton(options, obj);
    btn.anchor.set(0.5);
    btn.enabled = true;
    btn.updateTextPos();

    return btn;
  }

  public getFancyButton(obj: any): PixFancyButton {
    const options: any = obj.options;
    if (obj.textConfig) {
      options.text = this.getText(Util.deepClone(obj.textConfig));
    }
    const btn: PixFancyButton = new PixFancyButton(options, obj);
    btn.anchor.set(0.5);
    btn.enabled = true;
    btn.updateTextPos();

    return btn;
  }

  public getSlider(obj: any): PixSlider {
    const { configData, ...sliderData } = obj;
    return new PixSlider(sliderData, configData);
  }

  public getInput(obj: any): Input {
    let bg: any;
    if (obj.image) {
      bg = Sprite.from(obj.image);
    } else {
      const { width = 120, height = 50, radius = 8, color = 0xffffff, borderColor = 0x999999, borderWidth = 2 } = obj;
      bg = new Graphics()
        .roundRect(0, 0, width, height, radius)
        .fill(color)
        .stroke({ width: borderWidth, color: borderColor });
    }
    return new Input({ ...obj.options, bg });
  }

  public getBitmapText(obj: any): PixBMPText {
    const cloneData = JSON.parse(JSON.stringify(obj));
    let label = Util.getContent(cloneData.content);
    if (cloneData.contentText) {
      label = cloneData.contentText;
    }
    if (cloneData.toUpperCase) {
      label = label.toUpperCase();
    }
    //cloneData.style.fontFamily = GameProxy.config.FontFaces[cloneData.style.fontFamily];

    if (cloneData.fontMLProps != undefined) {
      if (cloneData.fontMLProps[appModel.language] != undefined) {
        const langProps = cloneData.fontMLProps[appModel.language];
        Object.keys(langProps).forEach((key) => {
          if (key === 'fontFamily') {
            cloneData.style[key] = GameProxy.config.FontFaces[langProps[key]] || langProps[key];
          } else {
            cloneData.style[key] = langProps[key];
          }
        });
      }
    }
    if (cloneData.tooltipMLProps != undefined) {
      if (cloneData.tooltipMLProps[appModel.language] != undefined) {
        const langProps = cloneData.tooltipMLProps[appModel.language];
        Object.keys(langProps).forEach((key) => {
          if (key === 'fontFamily') {
            cloneData.style[key] = GameProxy.config.FontFaces[langProps[key]] || langProps[key];
          } else {
            cloneData.style[key] = langProps[key];
          }
        });
      }
    }
    const style = new TextStyle(cloneData.style);
    return new PixBMPText({ text: label, style: style }, cloneData);
  }
  protected getFillGradient(colors: number[], offsets: number[]): FillGradient {
    const colorStops = colors.map((color, i) => ({
      offset: offsets[i] ?? i / Math.max(colors.length - 1, 1),
      color,
    }));

    return new FillGradient({
      type: 'linear',
      textureSpace: 'local',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops,
    });
  }
  public getText(obj: any): PixText {
    const cloneData = JSON.parse(JSON.stringify(obj));

    let label = Util.getContent(cloneData.content);

    if (cloneData.contentText) {
      label = cloneData.contentText;
    }

    if (cloneData.toUpperCase) {
      label = label.toUpperCase();
    }

    cloneData.style.fontFamily = GameProxy.config.FontFaces[cloneData.style.fontFamily];

    if (cloneData.style.mFontSize !== undefined && DeviceProxy.config.isDevice) {
      cloneData.style.fontSize = cloneData.style.mFontSize;
    }

    if (cloneData.fontMLProps !== undefined) {
      if (cloneData.fontMLProps[appModel.language] !== undefined) {
        cloneData.style.fontSize = cloneData.fontMLProps[appModel.language].fontSize;
      }
    }

    if (Array.isArray(cloneData?.style?.fill)) {
      cloneData.style.fill = this.getFillGradient(cloneData.style.fill, cloneData.style.fillGradientStops ?? []);

      delete cloneData.style.fillGradientStops;
    }

    const style = new TextStyle(cloneData.style);
    const txt = new PixText({ text: label, style }, cloneData);

    // REMOVE THIS:
    // txt.style = cloneData.style;

    if (obj.destroy) {
      if (GameProxy.config.textsToClear) {
        GameProxy.config.textsToClear.push(txt);
      }
    }

    return txt;
  }
  public getHTMLText(obj: any): PixHTMLText {
    const cloneData = JSON.parse(JSON.stringify(obj));
    let label = Util.getContent(cloneData.content);
    if (cloneData.contentText) {
      label = cloneData.contentText;
    }
    if (cloneData.toUpperCase) {
      label = label.toUpperCase();
    }
    cloneData.style.fontFamily = GameProxy.config.FontFaces[cloneData.style.fontFamily];

    if (cloneData.style.mFontSize != undefined && DeviceProxy.config.isDevice) {
      cloneData.style.fontSize = cloneData.style.mFontSize;
    }

    if (cloneData.fontMLProps != undefined) {
      if (cloneData.fontMLProps[appModel.language] != undefined) {
        cloneData.style.fontSize = cloneData.fontMLProps[appModel.language].fontSize;
      }
    }
    if (Array.isArray(cloneData.style.fill)) {
      const colorStops: any[] = cloneData.style.fill;
      const gradientFill: FillGradient = new FillGradient(0.5, 0, 0.5, 1);
      colorStops.forEach((number, index) => {
        const ratio = index / colorStops.length;
        gradientFill.addColorStop(ratio, number);
      });

      cloneData.style.fill = gradientFill;
    }
    const style = new TextStyle(cloneData.style);
    const txt = new PixHTMLText({ text: label, style: style }, cloneData);
    if (obj.destroy) {
      if (GameProxy.config.textsToClear) {
        GameProxy.config.textsToClear.push(txt);
      }
    }
    //txt.label = obj.name;
    return txt;
  }

  public getRectangle(
    width: number,
    height: number,
    color: number,
    x = 0,
    y = 0,
    name: string = 'Graphics',
  ): PixGraphics {
    return new PixGraphics().rect(x, y, width, height).fill(color);
    //graphics.configData = { name: name, width: width, height: height, x: x, y: y, color: color };
  }

  public getResponsiveGraphics(obj: any): PixResponsiveGraphics {
    return new PixResponsiveGraphics(obj);
  }
  public getRoundedRectangle(obj: any): PixGraphics {
    const rect = new PixGraphics().roundRect(obj.x, obj.y, obj.width, obj.height, obj.radius).fill(obj.color);
    if (obj.alpha != undefined) {
      rect.alpha = obj.alpha;
    }
    return rect;
  }

  public getRoundedRectangleWithBorder(obj: any): PixGraphics {
    return new PixGraphics().roundRect(obj.x, obj.y, obj.width, obj.height, obj.radius).fill(obj.color);
  }

  public getCircle(fill: number, radius: number): PixGraphics {
    const graphics: PixGraphics = new PixGraphics().circle(0, 0, radius).fill(fill);
    return graphics;
  }

  public getArc(
    centerX: number = 0,
    centerY: number = 0,
    radius: number,
    startAngle: number,
    endAngle: number,
    fill: number,
  ): PixGraphics {
    const graphics: PixGraphics = new PixGraphics();
    graphics.lineStyle(0, fill, 1);
    graphics.beginFill(fill, 1);
    graphics.moveTo(centerX, centerY);
    graphics.arc(centerX, centerY, radius, startAngle, endAngle);
    graphics.lineTo(centerX, centerY);
    graphics.endFill();
    return graphics;
  }

  public getPolygon(points: number[] | PointData[], fill: number, close?: boolean): PixGraphics {
    const graphics: PixGraphics = new PixGraphics();
    graphics.poly(points);
    graphics.fill(fill);
    return graphics;
  }

  public getBorderRectangle(
    width: number,
    height: number,
    backgroundColor: number,
    borderColor: number,
    borderWidth: number,
    x = 0,
    y = 0,
  ): PixGraphics {
    const graphics: PixGraphics = new PixGraphics().rect(x, y, width, height).fill(backgroundColor).stroke(borderColor);
    return graphics;
  }
  public getBorderRoundedRectangle(
    width: number,
    height: number,
    backgroundColor: number | string,
    borderColor: number,
    borderWidth: number,
    radius = 0,
    alpha = 1,
    backgroundAlpha = 1,
  ): PixGraphics {
    const graphics: PixGraphics = new PixGraphics()
      .roundRect(0, 0, width, height, radius)
      .fill(backgroundColor)
      .stroke({ width: borderWidth, color: borderColor });
    graphics.alpha = alpha;
    return graphics;
  }

  public getTextField1(tobj: any): any {
    let obj: any;
    if (typeof tobj === 'string') {
      obj = this.getTextProp(tobj);
    } else {
      if (DeviceProxy.isDevice() && tobj.mStyle != undefined) {
        obj = this.getTextProp(tobj.mStyle);
      } else {
        obj = this.getTextProp(tobj.style);
      }
    }
    if (obj === undefined) {
      return;
    }
    const newobj: any = {};
    for (const p in obj) {
      newobj[p] = obj[p];
    }
    newobj.breakWords = true;

    if (newobj.type === 'BitmapFont') {
      obj.fontName = newobj.fontFamily;
    } else {
      newobj.fontFamily = GameProxy.config.FontFaces[newobj.fontFamily];
    }
    let content = '';
    if (tobj.x != undefined) {
      obj.x = tobj.x;
    }
    if (tobj.y != undefined) {
      obj.y = tobj.y;
    }
    if (tobj.content) {
      content = Util.getContent(tobj.content);
      if (tobj.toUpperCase) {
        content = content.toUpperCase();
      }
    } else if (tobj.contentText) {
      content = tobj.contentText;
    }
    if (tobj.stroke != undefined) {
      newobj.stoke = tobj.stroke;
    }
    if (tobj.strokeThickness != undefined) {
      newobj.strokeThickness = tobj.strokeThickness;
    }

    if (tobj.fontSize != undefined) {
      newobj.fontSize = tobj.fontSize;
      obj.fontSize = tobj.fontSize;
    }

    if (tobj.mFontSize != undefined && DeviceProxy.config.isDevice) {
      newobj.fontSize = tobj.mFontSize;
      obj.fontSize = tobj.mFontSize;
    }

    if (tobj.mFontMLSize != undefined && DeviceProxy.config.isDevice) {
      newobj.mFontMLSize = tobj.mFontMLSize;
      obj.mFontMLSize = tobj.mFontMLSize;
    }

    if (tobj.fill != undefined) {
      newobj.fill = tobj.fill;
    }
    if (tobj.hAlign != undefined) {
      newobj.hAlign = tobj.hAlign;
    }
    if (tobj.lineHeight != undefined) {
      newobj.lineHeight = tobj.lineHeight;
    }
    if (tobj.letterSpacing != undefined) {
      newobj.letterSpacing = tobj.letterSpacing;
    }

    if (tobj.fontMLProps != undefined) {
      if (tobj.fontMLProps[appModel.language] != undefined) {
        for (const p in tobj.fontMLProps[appModel.language]) {
          newobj[p] = tobj.fontMLProps[appModel.language][p];
        }
      }
    }

    if (DeviceProxy.config.isDevice) {
      if (tobj.mWordWrapWidth != undefined) {
        newobj.wordWrap = true;
        newobj.wordWrapWidth = tobj.mWordWrapWidth;
      } else {
        if (tobj.wordWrapWidth != undefined) {
          newobj.wordWrap = true;
          newobj.wordWrapWidth = tobj.wordWrapWidth;
        }
      }
      if (tobj.mFill != undefined) {
        newobj.fill = tobj.mFill;
      }
    } else {
      if (tobj.wordWrapWidth != undefined) {
        newobj.wordWrap = true;
        newobj.wordWrapWidth = tobj.wordWrapWidth;
      }
    }

    if (tobj.align != undefined) {
      newobj.align = tobj.align;
    }
    if (tobj.hPadding != undefined) {
      obj.hPadding = tobj.hPadding;
    }
    if (tobj.vPadding != undefined) {
      obj.vPadding = tobj.vPadding;
    }

    let txt: any;
    if (newobj.type === 'BitmapFont') {
      txt = new Text(content, obj);
    } else {
      txt = new Text(content, newobj);
    }

    txt.configData = obj;
    if (tobj.anchor) {
      txt.anchor.set(tobj.anchor);
    }
    txt.resolution = DeviceProxy.config.appResolution == 1 ? 2 : DeviceProxy.config.appResolution;
    txt.selectable = false;
    txt.name = tobj.content;
    return txt;
  }

  protected getTextProp(stylename: string): any {
    const obj = ContentProxy.textConfig.FontConfig[stylename];
    let tobj;
    if (DeviceProxy.config.isDesktop && obj.Desktop) {
      tobj = obj.Desktop;
    } else {
      tobj = DeviceProxy.config.isTablet && obj.Tablet ? obj.Tablet : obj.Mobile;
    }
    const newobj: any = {};
    for (const p in tobj) {
      newobj[p] = tobj[p];
    }
    return newobj;
  }

  public getContainer(data: any = null): PixView {
    return new PixView(data);
  }

  public getDualSprite(obj: any): DualSprite {
    return new DualSprite(obj);
  }
  public getNineSliceSprite(name: string, data: any = null): PixNineSpliceSprite {
    let texture;
    if (DeviceProxy.config.isDesktop) {
      texture = this.getTexture(name);
    } else {
      if (data && data.mobileImage != undefined) {
        texture = this.getTexture(data.mobileImage);
      } else {
        texture = this.getTexture(name);
      }
    }
    const obj: any = {};
    obj.texture = texture;
    obj.leftWidth = data.nineSlice[0];
    obj.topHeight = data.nineSlice[1];
    obj.rightWidth = data.nineSlice[2];
    obj.bottomHeight = data.nineSlice[3];
    const sp: PixNineSpliceSprite = new PixNineSpliceSprite(obj);
    sp.configData = data;
    sp.label = name;
    sp.name = name;
    return sp;
  }
  public getSprite(name: string, data: any = null): PixSprite {
    let texture;
    if (DeviceProxy.config.isDesktop) {
      texture = this.getTexture(name);
    } else {
      if (data && data.mobileImage != undefined) {
        texture = this.getTexture(data.mobileImage);
      } else {
        texture = this.getTexture(name);
      }
    }
    const sp: PixSprite = new PixSprite(texture);
    sp.configData = data;
    sp.label = name;
    sp.name = name;
    return sp;
  }
  getSpriteFromTexture(texture: Texture): PixSprite {
    const sp: PixSprite = new PixSprite(texture);
    return sp;
  }
  public getTexture(name: string): Texture {
    if (name.length > 0) {
      return PIXI.Texture.from(name);
    }
  }

  public getSpineAnim(name: string, obj: any) {
    const spine = new PixSpine(obj);
    if (obj && obj.defaultState != undefined && obj.defaultState != '') {
      spine.playAnimation({ state: obj.defaultState, loop: obj.loop });
    }
    if (obj && obj.pivot) {
      spine.pivot.x = obj.pivot.x;
      spine.pivot.y = obj.pivot.y;
    }

    return spine;
  }

  public getAnimatedSprite(obj: any, configData: any): PixAnimatedSprite {
    const frames: any = [];
    let arr: any = [];
    const newarr: any = [];
    if (obj && obj.image != undefined) {
      frames.push(this.getTexture(obj.image));
    } else {
      arr = this.getAnimationFramesArray(obj);
      const len = arr.length;
      for (let i = 0; i < len; i++) {
        const tx = this.getTexture(arr[i]);
        if (!tx.noFrame) {
          newarr.push((tx as any).textureCacheIds);
          frames.push(tx);
        }
      }
    }
    const movie: PixAnimatedSprite = new PixAnimatedSprite(frames, configData);
    if (obj.image) {
      movie.name = obj.image;
    } else {
      movie.name = arr[0];
    }

    movie.anchor.set(0.5, 0.5);
    movie.animationSpeed = GameProxy.config.globalAnimSpeed;
    if (obj.loop != undefined) {
      movie.loop = obj.loop;
    }
    if (obj.scale != undefined) {
      movie.scale.set(obj.scale);
    }
    if (obj.animationSpeed) {
      movie.animationSpeed = obj.animationSpeed;
    }
    if (obj.playOnStart) {
      movie.play();
      if (obj.startFrame) {
        movie.gotoAndPlay(obj.startFrame);
      }
    }
    return movie;
  }
  public getAnimationFramesArray(obj: any): Array<any> {
    const arr: any = [];
    if (obj.checkPoint === undefined) {
      obj.checkPoint = 10;
    }
    if (obj.toAddZero == undefined) {
      obj.toAddZero = true;
    }
    if (obj.start >= 0) {
      if (obj.playReverse) {
        for (let j = obj.end - 1; j >= obj.start; j--) {
          if (obj.skipFrame) {
            if (j % 2 != 0) {
              continue;
            }
          }
          let str = obj.prefix;
          if (obj.toAddZero) {
            if (obj.checkPoint === 100) {
              if (j < 10) {
                str += j < obj.checkPoint ? '00' + j : j;
              } else if (j >= 10 && j < 100) {
                str += j < obj.checkPoint ? '0' + j : j;
              } else {
                str += j;
              }
            } else {
              str += j < obj.checkPoint ? '0' + j : j;
            }
          } else {
            str += j;
          }
          arr.push(str + obj.postfix);
        }
      } else {
        for (let j = obj.start; j <= obj.end; j++) {
          if (obj.skipFrame) {
            if (j % 2 != 0) {
              continue;
            }
          }
          let str = obj.prefix;
          if (obj.toAddZero) {
            if (obj.checkPoint === 100) {
              if (j < 10) {
                str += j < obj.checkPoint ? '00' + j : j;
              } else if (j >= 10 && j < 100) {
                str += j < obj.checkPoint ? '0' + j : j;
              } else {
                str += j;
              }
            } else {
              str += j < obj.checkPoint ? '0' + j : j;
            }
          } else {
            str += j;
          }
          arr.push(str + obj.postfix);
        }
      }
    }
    return arr;
  }

  public setPosition(obj: any, x: number, y: number): void {
    this.setPositionX(obj, x);
    this.setPositionY(obj, y);
  }

  setPositionX(obj: any, x: number): void {
    obj.position.x = Math.round(x);
  }
  setPositionY(obj: any, y: number): void {
    obj.position.y = Math.round(y);
  }

  // resize and adjusting views components
  public positionComponent(element: any): void {
    if (element.configData && element.configData.layoutData) {
      const layout: any = this.getDeviceSpecificLayout(element.configData.layoutData);
      this.positionElement(element, layout);
    }
  }
  public adjustElement(element: any): void {
    if (element && element.configData && element.configData.layoutData) {
      const layout: any = this.getDeviceSpecificLayout(element.configData.layoutData);
      if (layout) {
        if (layout.visible != undefined) {
          element.visible = layout.visible;
        }
        if (layout.rotation != undefined) {
          element.rotation = Util.getRadians(layout.rotation);
        }
        if (layout.fitToScreen) {
          this.doFullScreen(element, layout.refComponent, layout);
        } else {
          this.scaleElement(element, layout);
        }
        this.positionElement(element, layout);
      }
    } else {
      if (DeviceProxy.isDevice()) {
        const layout = element.configData;
        if (DeviceProxy.config.isPortrait) {
          if (layout?.pWidth) {
            element.width = layout.pWidth;
          }
          if (layout?.pHeight) {
            element.height = layout.pHeight;
          }
          if (layout?.pScale != undefined) {
            element.scale.set(layout.pScale);
          }
          if (layout?.px != undefined) {
            element.x = layout.px;
          }
          if (layout?.py != undefined) {
            element.y = layout.py;
          }
        } else {
          if (layout?.lWidth) {
            element.width = layout.lWidth;
          }
          if (layout?.lHeight) {
            element.height = layout.lHeight;
          }
          if (layout?.lScale != undefined) {
            element.scale.set(layout.lScale);
          }
          if (layout?.lx != undefined) {
            element.x = layout.lx;
          }
          if (layout?.ly != undefined) {
            element.y = layout.ly;
          }
        }
      }
    }
  }

  public positionElement(element: any, layout: any): void {
    if (layout) {
      if (layout.x != undefined) {
        this.setPositionX(element, layout.x);
      }
      if (layout.y != undefined) {
        this.setPositionY(element, layout.y);
      }
      if (layout.hAlign != undefined) {
        this.alignHorizontal(element, layout);
      }
      if (layout.vAlign != undefined) {
        this.alignVertical(element, layout);
      }
      if (layout.vPosition != undefined) {
        this.positionVertical(element, layout);
      }
      if (DeviceProxy.isDevice()) {
        if (DeviceProxy.config.isPortrait) {
          if (layout.pScale != undefined) {
            element.scale.set(layout.pScale);
          }
          if (layout.px != undefined) {
            this.setPositionX(element, layout.px);
          }
          if (layout.py != undefined) {
            this.setPositionY(element, layout.py);
          }
        } else {
          if (layout.lScale != undefined) {
            element.scale.set(layout.lScale);
          }
          if (layout.lx != undefined) {
            this.setPositionX(element, layout.lx);
          } else {
            if (layout.x != undefined) {
              this.setPositionX(element, layout.x);
            }
          }
          if (layout.ly != undefined) {
            this.setPositionY(element, layout.ly);
          } else {
            if (layout.y != undefined) {
              this.setPositionY(element, layout.y);
            }
          }
        }
      }
    }
  }
  public alignHorizontal(element: any, layout: any): void {
    let refElement: any;
    if (!element) {
      return;
    }
    if (layout.refElement) {
      refElement = layout.refElement;
    } else if (element.parent && layout.posRefComponent) {
      if (layout.posRefComponent === 'window') {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        refElement = {
          x: 0,
          y: 0,
          getWidth: function () {
            return that.getGameWidth();
          },
          getHeight: function () {
            return that.getGameHeight();
          },
        };
      } else {
        refElement = element.parent.elementsList[layout.posRefComponent];
      }
    } else if (element.parent && layout.refComponent) {
      refElement = element.parent.elementsList[layout.refComponent];
    } else if (layout.hRefComponent) {
      refElement = element.parent.elementsList[layout.hRefComponent];
    } else if (layout.parentRefComponent) {
      refElement = element.parent.parent ? element.parent.parent[layout.parentRefComponent] : null;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      refElement = {
        x: 0,
        y: 0,
        getWidth: function () {
          return that.getGameWidth();
        },
        getHeight: function () {
          return that.getGameHeight();
        },
      };
    }
    if (layout.hPadding != undefined) {
      if (layout.hPadding === 'width') {
        layout.hPadding = element.getWidth();
      } else if (layout.hPadding === '-width') {
        layout.hPadding = -element.getWidth();
      }
    }
    if (!refElement) {
      return;
    }
    if (layout.hPaddingPerc != undefined) {
      layout.hPadding = refElement.getWidth() * layout.hPaddingPerc;
    }
    if (element.parent && layout.alignRefComponent) {
      refElement = element.parent.elementsList[layout.alignRefComponent];
    }
    switch (layout.hAlign) {
      case 'left':
        if (element.anchor && element.anchor.x != 0) {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionX(
              element,
              refElement.x -
                (refElement.getWidth() * refElement.anchor.x - element.getWidth() * element.anchor.x) +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          } else {
            this.setPositionX(
              element,
              refElement.x + element.getWidth() * element.anchor.x + Util.getDefaultValue(layout.hPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionX(
            element,
            refElement.x + element.getWidth() * element.configData.anchor.x + Util.getDefaultValue(layout.hPadding, 0),
          );
        } else {
          this.setPositionX(element, refElement.x + Util.getDefaultValue(layout.hPadding, 0));
        }
        break;
      case 'leftBefore':
        if (element.anchor && element.anchor.x != 0) {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionX(
              element,
              refElement.x -
                refElement.getWidth() * refElement.anchor.x -
                element.getWidth() * element.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          } else {
            this.setPositionX(
              element,
              refElement.x - element.getWidth() * element.anchor.x + Util.getDefaultValue(layout.hPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionX(
            element,
            refElement.x -
              element.getWidth() +
              element.getWidth() * element.configData.anchor.x +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        } else {
          this.setPositionX(
            element,
            refElement.x +
              (refElement.getWidth() * 0.5 - element.getWidth()) / 2 +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        }
        break;
      case 'center':
        if (element.anchor && element.anchor.x != 0) {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionX(element, refElement.x + Util.getDefaultValue(layout.hPadding, 0));
          } else {
            this.setPositionX(
              element,
              refElement.x +
                (refElement.getWidth() - element.getWidth()) / 2 +
                element.getWidth() * element.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionX(
            element,
            refElement.x +
              (refElement.getWidth() - element.getWidth()) / 2 +
              element.getWidth() * element.configData.anchor.x +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        } else {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionX(
              element,
              refElement.x +
                (refElement.getWidth() - element.getWidth()) / 2 -
                refElement.getWidth() * refElement.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          } else {
            this.setPositionX(
              element,
              refElement.x +
                (refElement.getWidth() - element.getWidth()) / 2 +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          }
        }
        break;
      case 'right':
        if (element.anchor && element.anchor.x != 0) {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionX(
              element,
              refElement.x +
                refElement.getWidth() * refElement.anchor.x -
                element.getWidth() * element.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          } else {
            this.setPositionX(
              element,
              refElement.x +
                refElement.getWidth() -
                element.getWidth() +
                element.getWidth() * element.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionX(
            element,
            refElement.x +
              refElement.getWidth() -
              element.getWidth() +
              element.getWidth() * element.configData.anchor.x +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        } else {
          this.setPositionX(
            element,
            refElement.x + (refElement.getWidth() - element.getWidth()) + Util.getDefaultValue(layout.hPadding, 0),
          );
        }
        break;
      case 'rightAfter':
        if (element.anchor && element.anchor.x != 0) {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionX(
              element,
              refElement.x +
                refElement.getWidth() * refElement.anchor.x +
                element.getWidth() * element.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          } else {
            this.setPositionX(
              element,
              refElement.x +
                refElement.getWidth() +
                element.getWidth() * element.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionX(
              element,
              refElement.x +
                refElement.getWidth() * refElement.anchor.x +
                refElement.getWidth() -
                element.getWidth() +
                element.getWidth() * element.configData.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          } else {
            this.setPositionX(
              element,
              refElement.x +
                refElement.getWidth() -
                element.getWidth() +
                element.getWidth() * element.configData.anchor.x +
                Util.getDefaultValue(layout.hPadding, 0),
            );
          }
        } else {
          this.setPositionX(element, refElement.x + (refElement.getWidth() + Util.getDefaultValue(layout.hPadding, 0)));
        }
        break;
      case 'leftHalfCenter':
        if (element.anchor && element.anchor.x != 0) {
          this.setPositionX(
            element,
            refElement.x +
              (refElement.getWidth() * 0.5 - element.getWidth()) / 2 +
              element.getWidth() * element.anchor.x +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        } else if (element.configData.anchor != undefined) {
          this.setPositionX(
            element,
            refElement.x +
              (refElement.getWidth() * 0.5 - element.getWidth()) / 2 +
              element.getWidth() * element.configData.anchor.x +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        } else {
          this.setPositionX(
            element,
            refElement.x +
              (refElement.getWidth() * 0.5 - element.getWidth()) / 2 +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        }
        break;
      case 'rightHalfCenter':
        if (element.anchor && element.anchor.x != 0) {
          this.setPositionX(
            element,
            refElement.getWidth() * 0.5 +
              refElement.x +
              (refElement.getWidth() * 0.5 - element.getWidth()) / 2 +
              element.getWidth() * element.anchor.x +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        } else if (element.configData.anchor != undefined) {
          this.setPositionX(
            element,
            refElement.getWidth() * 0.5 +
              refElement.x +
              (refElement.getWidth() * 0.5 - element.getWidth()) / 2 +
              element.getWidth() * element.configData.anchor.x +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        } else {
          this.setPositionX(
            element,
            refElement.getWidth() * 0.5 +
              refElement.x +
              (refElement.getWidth() * 0.5 - element.getWidth()) / 2 +
              Util.getDefaultValue(layout.hPadding, 0),
          );
        }
        break;
      default:
        break;
    }
  }
  public alignVertical(element: any, layout: any = null): void {
    let refElement: any;
    let refParent: any;
    if (layout.refElement) {
      refElement = layout.refElement;
    } else if (element.parent && layout.posRefComponent) {
      if (layout.posRefComponent === 'window') {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        refElement = {
          x: 0,
          y: 0,
          getWidth: function () {
            return that.getGameWidth();
          },
          getHeight: function () {
            return that.getGameHeight();
          },
        };
      } else {
        refElement = element.parent.elementsList[layout.posRefComponent];
      }
    } else if (element.parent && layout.refComponent && layout.refComponentChildren) {
      refElement = element.parent.elementsList[layout.refComponent][layout.refComponentChildren];
      refParent = element.parent.elementsList[layout.refComponent];
    } else if (element.parent && layout.refComponent) {
      refElement = element.parent.elementsList[layout.refComponent];
    } else if (layout.vRefComponent) {
      refElement = element.parent.elementsList[layout.vRefComponent];
    } else if (layout.parentRefComponent) {
      refElement = element.parent.parent ? element.parent.parent[layout.parentRefComponent] : null;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      refElement = {
        x: 0,
        y: 0,
        getWidth: function () {
          return that.getGameWidth();
        },
        getHeight: function () {
          return that.getGameHeight();
        },
      };
    }
    if (layout.hPadding != undefined) {
      if (layout.hPadding === 'width') {
        layout.hPadding = element.width;
      } else if (layout.hPadding === '-width') {
        layout.hPadding = -element.width;
      } else if (layout.hPadding === 'width/2') {
        layout.hPadding = element.width / 2;
      } else if (layout.hPadding === '-width/2') {
        layout.hPadding = -element.width / 2;
      }
    }
    if (layout.vPadding != undefined) {
      if (layout.vPadding === 'height') {
        layout.vPadding = element.height;
      } else if (layout.vPadding === '-height') {
        layout.vPadding = -element.height;
      } else if (layout.vPadding === 'height/2') {
        layout.vPadding = element.height / 2;
      } else if (layout.vPadding === '-height/2') {
        layout.vPadding = -element.height / 2;
      }
    }
    if (!refElement) {
      return;
    }
    if (layout.vPaddingPerc != undefined) {
      layout.vPadding = refElement.getHeight() * layout.vPaddingPerc;
    }
    if (element.parent && layout.alignRefComponent) {
      refElement = element.parent.elementsList[layout.alignRefComponent];
    }
    if (element.parent && layout.vAlignRefComponent) {
      refElement = element.parent.elementsList[layout.vAlignRefComponent];
    }
    switch (layout.vAlign) {
      case 'spineTop':
        this.setPositionY(element, refElement.y + element.getHeight() + Util.getDefaultValue(layout.vPadding, 0));
        break;
      case 'top':
        if (element.anchor && element.anchor.y != 0) {
          if (refElement.anchor && refElement.anchor.y != 0) {
            this.setPositionY(
              element,
              refElement.y -
                (refElement.getHeight() * refElement.anchor.y - element.getHeight() * element.anchor.y) +
                Util.getDefaultValue(layout.vPadding, 0),
            );
          } else {
            this.setPositionY(
              element,
              refElement.y + element.getHeight() * element.anchor.y + Util.getDefaultValue(layout.vPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionY(
            element,
            refElement.y + element.getHeight() * element.configData.anchor.y + Util.getDefaultValue(layout.vPadding, 0),
          );
        } else {
          this.setPositionY(element, refElement.y + Util.getDefaultValue(layout.vPadding, 0));
        }
        break;
      case 'topUp':
        if (element.anchor && element.anchor.y != 0) {
          if (refElement.anchor && refElement.anchor.x != 0) {
            this.setPositionY(
              element,
              refElement.y -
                refElement.getHeight() * refElement.anchor.y -
                element.getHeight() * element.anchor.y +
                Util.getDefaultValue(layout.vPadding, 0),
            );
          } else {
            this.setPositionY(
              element,
              refElement.y +
                element.getHeight() * element.anchor.y +
                Util.getDefaultValue(layout.vPadding, 0) -
                element.getHeight(),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionY(
            element,
            refElement.y +
              element.getHeight() * element.configData.anchor.y +
              Util.getDefaultValue(layout.vPadding, 0) -
              element.getHeight(),
          );
        } else {
          this.setPositionY(element, refElement.y + Util.getDefaultValue(layout.vPadding, 0) - element.getHeight());
        }
        break;
      case 'middle':
        if (element.anchor && element.anchor.y != 0) {
          if (refElement.anchor && refElement.anchor.y != 0) {
            this.setPositionY(element, refElement.y + Util.getDefaultValue(layout.vPadding, 0));
          } else {
            this.setPositionY(
              element,
              refElement.y +
                (refElement.getHeight() - element.getHeight()) / 2 +
                element.height * element.anchor.y +
                Util.getDefaultValue(layout.vPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionY(
            element,
            refElement.y +
              (refElement.getHeight() - element.getHeight()) / 2 +
              element.height * element.configData.anchor.y +
              Util.getDefaultValue(layout.vPadding, 0),
          );
        } else {
          this.setPositionY(
            element,
            refElement.y +
              (refElement.getHeight() - element.getHeight()) / 2 +
              Util.getDefaultValue(layout.vPadding, 0),
          );
        }
        break;
      case 'elementPosition':
        this.setPositionY(
          element,
          refParent.y + refElement.y * refParent.scale.y + Util.getDefaultValue(layout.vPadding, 0),
        );
        break;
      case 'bottom':
        if (element.anchor && element.anchor.y != 0) {
          if (refElement.anchor && refElement.anchor.y != 0) {
            this.setPositionY(
              element,
              refElement.y +
                (refElement.getHeight() * refElement.anchor.y - element.getHeight() * element.anchor.y) +
                Util.getDefaultValue(layout.vPadding, 0),
            );
          } else {
            this.setPositionY(
              element,
              refElement.y +
                refElement.getHeight() -
                element.getHeight() +
                element.getHeight() * element.anchor.y +
                Util.getDefaultValue(layout.vPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionY(
            element,
            refElement.y +
              refElement.getHeight() -
              element.getHeight() +
              element.getHeight() * element.configData.anchor.y +
              Util.getDefaultValue(layout.vPadding, 0),
          );
        } else {
          this.setPositionY(
            element,
            refElement.y + (refElement.getHeight() - element.getHeight()) + Util.getDefaultValue(layout.vPadding, 0),
          );
        }
        break;
      case 'bottomDown':
        if (element.anchor && element.anchor.y != 0) {
          if (refElement.anchor && refElement.anchor.y != 0) {
            this.setPositionY(
              element,
              refElement.y +
                refElement.getHeight() * refElement.anchor.y +
                element.getHeight() * element.anchor.y +
                Util.getDefaultValue(layout.vPadding, 0),
            );
          } else {
            this.setPositionY(
              element,
              refElement.y +
                refElement.getHeight() +
                element.getHeight() * element.anchor.y +
                Util.getDefaultValue(layout.vPadding, 0),
            );
          }
        } else if (element.configData.anchor != undefined) {
          this.setPositionY(
            element,
            refElement.y +
              refElement.getHeight() +
              element.getHeight() * element.configData.anchor.y +
              Util.getDefaultValue(layout.vPadding, 0),
          );
        } else {
          this.setPositionY(element, refElement.y + refElement.getHeight() + Util.getDefaultValue(layout.vPadding, 0));
        }
        break;
      case 'bottomUp':
        if (element.anchor && element.anchor.y != 0) {
          this.setPositionY(
            element,
            refElement.y +
              refElement.getHeight() -
              element.getHeight() * element.anchor.y +
              Util.getDefaultValue(layout.vPadding, 0),
          );
        } else if (element.configData.anchor != undefined) {
          this.setPositionY(
            element,
            refElement.y +
              refElement.getHeight() -
              element.getHeight() * (1 - element.configData.anchor.y) +
              Util.getDefaultValue(layout.vPadding, 0),
          );
        } else {
          this.setPositionY(
            element,
            refElement.y + refElement.getHeight() - element.getHeight() + Util.getDefaultValue(layout.vPadding, 0),
          );
        }
        break;
      default:
        break;
    }
  }
  positionVertical(element: any, layout: any) {
    let refElement: any;
    if (layout.refComponent) {
      refElement = element.parent.elementsList[layout.refComponent];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      refElement = {
        x: 0,
        y: 0,
        getWidth: function () {
          return that.getGameWidth();
        },
        getHeight: function () {
          return that.getGameHeight();
        },
      };
    }
    if (layout.vPosition != undefined) {
      if (layout.vPositionAfter) {
        const elementBefore = element.parent.elementsList[layout.vPositionAfter];
        this.setPositionY(
          element,
          elementBefore.y +
            elementBefore.height +
            elementBefore.getHeight() * layout.vPosition +
            Util.getDefaultValue(layout.vPadding, 0),
        );
      } else if (layout.vPositionBefore) {
        const elementAfter = element.parent.elementsList[layout.vPositionBefore];
        this.setPositionY(
          element,
          elementAfter.y -
            element.getHeight() -
            refElement.getHeight() * layout.vPosition +
            Util.getDefaultValue(layout.vPadding, 0),
        );
      } else {
        this.setPositionY(
          element,
          refElement.y + refElement.getHeight() * layout.vPosition + Util.getDefaultValue(layout.vPadding, 0),
        );
      }
    }
  }
  public scaleElement(element: any, layout: any): void {
    if (!element) {
      return;
    }
    const maxScale: number = Util.getDefaultValue(layout.maxScale, 0);
    const minScale: number = Util.getDefaultValue(layout.minScale, 0);
    let refElement: any;
    if (element.parent && layout.refComponent) {
      refElement = element.parent.elementsList[layout.refComponent];
      if (refElement == undefined) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        refElement = {
          x: 0,
          y: 0,
          getWidth: function () {
            return that.getGameWidth();
          },
          getHeight: function () {
            return that.getGameHeight();
          },
        };
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      refElement = {
        x: 0,
        y: 0,
        getWidth: function () {
          return that.getGameWidth();
        },
        getHeight: function () {
          return that.getGameHeight();
        },
      };
    }
    if (!refElement) {
      return;
    }
    if (layout.width != undefined) {
      element.width = layout.width;
    }
    if (layout.height != undefined) {
      element.height = layout.height;
    }
    if (layout.scale != undefined) {
      element.scale.set(layout.scale);
    }

    if (layout.widthPerc != undefined && layout.heightPerc != undefined) {
      element.scale.set(1);
      const wsc: number = (refElement.getWidth() * layout.widthPerc) / element.getWidth();
      const hsc: number = (refElement.getHeight() * layout.heightPerc) / element.getHeight();
      let sc = Math.min(wsc, hsc);

      if (maxScale != 0) {
        sc = Math.min(sc, maxScale);
      }
      if (minScale != 0) {
        sc = Math.max(sc, minScale);
      }
      element.scale.set(sc);
      if (sc != Infinity) {
        element.scale.set(sc);
      }
    } else {
      if (layout.widthPerc != undefined) {
        element.scale.set(1);
        let sc: number = (refElement.getWidth() * layout.widthPerc) / element.getWidth();
        if (maxScale != 0) {
          sc = Math.min(sc, maxScale);
        }
        if (minScale != 0) {
          sc = Math.max(sc, minScale);
        }
        if (sc != Infinity) {
          element.scale.set(sc);
        }
      }
      if (layout.heightPerc != undefined) {
        element.scale.set(1);

        let sc: number = (refElement.getHeight() * layout.heightPerc) / element.getHeight();
        if (maxScale != 0) {
          sc = Math.min(sc, maxScale);
        }
        if (sc != Infinity) {
          element.scale.set(sc);
        }
      }
    }
    if (layout.widthPercForce != undefined) {
      element.width = refElement.getWidth() * layout.widthPercForce;
    }
    if (layout.heightPercForce != undefined) {
      element.height = refElement.getHeight() * layout.heightPercForce;
    }
    if (layout.maxHeight != undefined) {
      if (element.height > layout.maxHeight) {
        element.height = layout.maxHeight;
      }
    }
    if (layout.minHeight != undefined) {
      if (element.height < layout.minHeight) {
        element.height = layout.minHeight;
      }
    }
    if (layout.widthPadding != undefined) {
      element.width = element.width + layout.widthPadding;
    }
    if (layout.heightPadding != undefined) {
      element.height = element.height + layout.heightPadding;
    }
  }

  public doFullScreen(element: any, refComponent: any = null, layout): void {
    let refElement;
    if (element.parent && refComponent) {
      refElement = element.parent.elementsList[refComponent];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      if (element.configData.considerFullView) {
        const bottomHeight = 250 * GameProxy.config.appBottomBarScale;
        refElement = {
          x: 0,
          y: 0,
          getWidth: function () {
            return that.getGameWidth();
          },
          getHeight: function () {
            return that.getGameHeight() + bottomHeight;
          },
        };
      } else {
        refElement = {
          x: 0,
          y: 0,
          getWidth: function () {
            return that.getGameWidth();
          },
          getHeight: function () {
            return that.getGameHeight();
          },
        };
      }
    }
    if (!refElement) {
      return;
    }
    if (element.constructor.name === 'PixGraphics') {
      element.width = this.getGameWidth();
      element.height = this.getGameHeight();
    } else {
      element.scale.set(1);
      const wsc: number = refElement.getWidth() / element.getWidth();
      const hsc: number = refElement.getHeight() / element.getHeight();
      element.scale.set(Math.max(wsc, hsc) * Util.getDefaultValue(layout?.fullScreenScale, 1));
    }
  }

  public getGameWidth() {
    return DeviceProxy.config.gameWidth;
  }
  getGameHeight() {
    return DeviceProxy.config.gameHeight;
  }

  protected getDeviceSpecificLayout(data: any): any {
    let obj: any = null;
    if (data) {
      if (DeviceProxy.config.isDesktop) {
        const isWindowPortrait = DeviceProxy.config.isPortrait;
        if (isWindowPortrait && data.DesktopPortrait) {
          obj = data.DesktopPortrait;
        } else {
          obj = data.Desktop ?? data.Landscape ?? data.Portrait;
        }
      } else {
        if (DeviceProxy.config.isLandscape) {
          if (this.isShortPhone()) {
            obj = data.SmallLandscape ?? data.SmallLandscape ?? data.Landscape ?? data.Portrait ?? data.Desktop;
          } else {
            obj = data.Landscape ?? data.Portrait ?? data.Desktop;
          }
        } else {
          if (this.isShortPhone()) {
            obj = data.SmallPortrait ?? data.SmallPortrait ?? data.Portrait ?? data.Landscape ?? data.Desktop;
          } else {
            obj = data.Portrait ?? data.Landscape ?? data.Desktop;
          }
        }
      }
    }
    return obj;
  }

  public updateWordWrapWidth(txt: Text, width: number, align = 'center'): void {
    txt.style.wordWrap = true;
    txt.style.wordWrapWidth = width;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    txt.style.align = align;
    const str = txt.text;
    txt.text = 'ADFASDF';
    txt.text = str;
  }
  public updateTextColor(txt: Text, color: number) {
    txt.style.fill = color;
  }
  public updateFontSize(txt: Text, size: number) {
    const t: string = txt.text;
    txt.style.fontSize = size;
    txt.text = 'BBB';
    txt.text = t;
  }

  public destroyView(view: any, cleanUp = false): void {
    if (cleanUp === undefined) {
      const cleanUp = false;
    }
    if (view && view.objectType) {
      if (view.objectType.indexOf('Text') >= 0) {
        cleanUp = true;
      }
    }
    if (view && view.configData?.type == 'Text') {
      cleanUp = true;
    }
    if (view) {
      view.destroy(cleanUp);
      view = undefined;
    }
  }

  public setClickable(btn: any, flag: boolean): void {
    btn.interactive = flag;
    btn.buttonMode = flag;
  }
  public setHandCursor(btn: any, flag: boolean): void {
    btn.useHandCursor = flag;
    btn.buttonMode = flag;
  }
  public setModalState(element: any): void {
    element.buttonMode = false;
    element.interactive = true;
  }

  public stopPropagation(element: any): void {
    element.eventMode = 'static';
    element.on('pointerdown', (e: any) => e.stopPropagation());
  }

  public removeInteraction(btn: any): void {
    btn.buttonMode = false;
    btn.interactive = false;
  }
  public resumeInteraction(btn: any): void {
    btn.buttonMode = true;
    btn.interactive = true;
  }
  public addInteraction(btn: any, callback: any = null, params: any = null): void {
    btn.on('touchend', callback, params);
    btn.on('mouseup', callback, params);
  }
  public addHoverInteraction(btn: any, callback: any = null, params: any = null): void {
    btn.on('touchstart', callback, params);
    btn.on('mouseover', callback, params);
  }
  public addUpInteraction(btn: any, callback: any = null, params: any = null): void {
    btn.on('touchend', callback, params);
    btn.on('mouseup', callback, params);
  }
  public addDownInteraction(btn: any, callback: any = null, params: any = null): void {
    btn.on('touchstart', callback, params);
    btn.on('mousedown', callback, params);
  }
  public addOutInteraction(btn: any, callback: any = null, params: any = null): void {
    btn.on('touchout', callback, params);
    btn.on('mouseout', callback, params);
  }
  public addMouseUpOutsideInteraction(btn: any, callback: any = null, params: any = null): void {
    btn.on('touchendoutside', callback, params);
    btn.on('mouseupoutside', callback, params);
  }
  public addMoveInteraction(btn: any, callback: any = null, params: any = null): void {
    btn.on('touchmove', callback, params);
    btn.on('mousemove', callback, params);
  }

  public glowButton(btn: any): void {
    const flt = new GlowFilter({ distance: 15, outerStrength: 2, color: 0x02f5ac });
    btn.filters = [flt];
  }

  public removeGlow(btn: any) {
    btn.filters = null;
  }
  public pulsateButton(btn: any): void {
    btn.lastScaleX = btn.scale.x;
    btn.lastScaleY = btn.scale.y;
    AnimationProxy.animateTween(btn, {
      duration: 0.5,
      scaleX: btn.lastScaleX * 1.1,
      scaleY: btn.lastScaleY * 1.1,
      yoyo: true,
      repeat: -1,
    });
  }

  public stopPulsating(btn: any): void {
    AnimationProxy.killTweensOf(btn);
  }

  public greyOutElement(element: any): void {
    const flt: GrayscaleFilter = new GrayscaleFilter();
    element.filters = [flt];
  }

  public revertElement(element: any): void {
    element.filters = null;
  }

  public setToOriginalPosition(element: any): void {
    element.x = element.configData.x;
    element.y = element.configData.y;
  }

  public destroyViewV2(view: any, parent: any = null): void {
    if (view) {
      AnimationProxy.killTweensOf(view);
      view.children.forEach((child) => {
        AnimationProxy.killTweensOf(child);
        //child.destroy({ children: true })
        child.children.forEach((child2) => {
          AnimationProxy.killTweensOf(child2);
          child2.destroy();
          child2 = null;
        });
        child = null;
      });
      view.removeChildren();
      if (parent) {
        parent.elementsList[view.name] = null;
      }
      view.destroy();
      view = null;
    }
  }

  public async cleanUpGPU() {
    if (GameProxy.config.textsToClear) {
      const len = GameProxy.config.textsToClear.length;
      for (let k = 0; k < len; k++) {
        await GameProxy.config.textsToClear[k].destroy({ texture: true });
      }
    }

    if (GameProxy.config.imagesToClear) {
      const len = GameProxy.config.imagesToClear.length;
      for (let k = 0; k < len; k++) {
        await GameProxy.config.imagesToClear[k].cleanUpGPU();
      }
    }
    GameProxy.config.textsToClear = [];
    GameProxy.config.imagesToClear = [];
  }

  adjustForMobile(element) {
    const isWindowPortrait = window.innerHeight > window.innerWidth;
    if (DeviceProxy.config.isDesktop) {
      if (element.configData.DesktopPortrait && isWindowPortrait) {
        if (element.configData.pScale != undefined) {
          if (typeof element.configData.pScale === 'object') {
            if (element.configData.pScale.x) {
              element.scale.x = element.configData.pScale.x;
            }
            if (element.configData.pScale.y) {
              element.scale.y = element.configData.pScale.y;
            }
          } else {
            element.scale.set(element.configData.pScale);
          }
        }
        if (element.configData.px != undefined) {
          element.x = element.configData.px;
        }
        if (element.configData.py != undefined) {
          element.y = element.configData.py;
        }
        if (element.configData.pbgWidth != undefined) {
          if (element.sliderOptions) {
            element.sliderOptions.bgWidth = element.configData.pbgWidth;
          }
          if (element.bg) {
            element.bg.width = element.configData.pbgWidth;
          }
          if (element.fill && !element.sliderOptions.fillWidth) {
            element.fill.width = element.configData.pbgWidth;
          }
          if (element.updateSlider) {
            element.updateSlider();
          }
        }
      } else {
        if (element.configData.scale != undefined) {
          if (typeof element.configData.scale === 'object') {
            if (element.configData.scale.x) {
              element.scale.x = element.configData.scale.x;
            }
            if (element.configData.scale.y) {
              element.scale.y = element.configData.scale.y;
            }
          } else {
            element.scale.set(element.configData.scale);
          }
        }
        if (element.configData.bgWidth != undefined) {
          if (element.sliderOptions) {
            element.sliderOptions.bgWidth = element.configData.bgWidth;
          }
          if (element.bg) {
            element.bg.width = element.configData.bgWidth;
          }
          if (element.fill && !element.sliderOptions.fillWidth) {
            element.fill.width = element.configData.bgWidth;
          }
          if (element.updateSlider) {
            element.updateSlider();
          }
        }
      }
    } else {
      if (DeviceProxy.config.isPortrait) {
        if (element.configData.pScale != undefined) {
          if (typeof element.configData.pScale === 'object') {
            if (element.configData.pScale.x) {
              element.scale.x = element.configData.pScale.x;
            }
            if (element.configData.pScale.y) {
              element.scale.y = element.configData.pScale.y;
            }
          } else {
            element.scale.set(element.configData.pScale);
          }
        }
        if (element.configData.px != undefined) {
          element.x = element.configData.px;
        }
        if (element.configData.py != undefined) {
          element.y = element.configData.py;
        }
        if (element.configData.pbgWidth != undefined) {
          if (element.sliderOptions) {
            element.sliderOptions.bgWidth = element.configData.pbgWidth;
          }
          if (element.bg) {
            element.bg.width = element.configData.pbgWidth;
          }
          if (element.fill && !element.sliderOptions.fillWidth) {
            element.fill.width = element.configData.pbgWidth;
          }
          if (element.updateSlider) {
            element.updateSlider();
          }
        }
      } else {
        if (element.configData.lScale != undefined) {
          if (typeof element.configData.lScale === 'object') {
            if (element.configData.lScale.x) {
              element.scale.x = element.configData.lScale.x;
            }
            if (element.configData.lScale.y) {
              element.scale.y = element.configData.lScale.y;
            }
          } else {
            element.scale.set(element.configData.lScale);
          }
        }
        if (element.configData.lx != undefined) {
          element.x = element.configData.lx;
        }
        if (element.configData.ly != undefined) {
          element.y = element.configData.ly;
        }
        if (element.configData.lbgWidth != undefined) {
          if (element.sliderOptions) {
            element.sliderOptions.bgWidth = element.configData.lbgWidth;
          }
          if (element.bg) {
            element.bg.width = element.configData.lbgWidth;
          }
          if (element.fill && !element.sliderOptions.fillWidth) {
            element.fill.width = element.configData.lbgWidth;
          }
          if (element.updateSlider) {
            element.updateSlider();
          }
        }
      }
    }
  }

  setPercentageScale(element, widthPerc, heightPerc, maxScale = 2) {
    element.scale.set(1);
    let sc = 1;
    const wsc = (this.getGameWidth() * widthPerc) / element.width;
    const hsc = (this.getGameHeight() * heightPerc) / element.height;
    sc = Math.min(wsc, hsc);
    sc = Math.min(sc, maxScale);
    element.scale.set(sc);
  }
  getPercentageWidth(val) {
    return this.getGameWidth() * val;
  }
  getPercentageHeight(val) {
    return this.getGameHeight() * val;
  }

  public getGlowInstance(element: any, glow: GlowFilter): any {
    try {
      const app = GameProxy.config.app;
      element.filters = [glow];
      const texture = app.renderer.generateTexture(element);
      const sp = new PixSprite(texture);
      element.filters = null;
      return sp;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return null;
    }
  }

  public setRelativeScale(
    element: any,
    widthPerc: number,
    heightPerc: number = 1,
    relativeTo: any = null,
    maxScale: number,
    minScale: number,
  ): void {
    if (!relativeTo) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that: any = this;
      relativeTo = {
        getWidth: function () {
          return that.getGameWidth();
        },
        getHeight: function () {
          return that.getGameHeight();
        },
      };
    }
    element.scale.set(1);
    const wsc = (relativeTo.getWidth() * widthPerc) / element.width;
    const hsc = (relativeTo.getHeight() * heightPerc) / element.height;
    let sc: number = Math.min(wsc, hsc);
    if (minScale != 0) {
      sc = Math.max(sc, minScale);
    }
    if (maxScale != 0) {
      sc = Math.min(sc, maxScale);
    }
    element.scale.set(sc);
    if (DeviceProxy.config.isDevice) {
      if (element.width < minMobileWidth) {
        element.scale.set(1);
        const sc = minMobileWidth / element.width;
        element.scale.set(sc);
      }
      if (element.height < minMobileHeight) {
        element.scale.set(1);
        const sc = minMobileHeight / element.height;
        element.scale.set(sc);
      }
    }
  }
  public setRelativePosition(
    element: any,
    hAlign: string,
    vAlign: string,
    relativeTo: any = null,
    hPadding: number,
    vPadding: number,
  ): void {
    if (!relativeTo) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that: any = this;
      relativeTo = {
        getWidth: function () {
          return that.getGameWidth();
        },
        getHeight: function () {
          return that.getGameHeight();
        },
      };
    }
  }

  public isShortPhone(): boolean {
    const shortScreen = Math.min(window.screen.width, window.screen.height);
    const longScreen = Math.max(window.screen.width, window.screen.height);
    return DeviceProxy.config.isIOSDevice && shortScreen <= 375 && longScreen <= 667;
  }
}

export const UIUtil = new UIUtilService();
