import { PixView } from './PixView';
import { Assets, Sprite } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { GameProxy } from '@core/models/GameConfigProxy';

export class PixDynamicSprite extends PixView {
  public name: string;
  private sp: Sprite;
  private intervalId: any;
  private boundingBox: PixGraphics;
  private lastImage: string;
  private loader: PixSprite;
  private imageURL: string;

  constructor(configData: any) {
    super(null);
    this.configData = {};
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
    if (this.configData.boundingRect) {
      this.boundingBox = UIUtil.getRectangle(
        this.configData.boundingRect.width,
        this.configData.boundingRect.height,
        0xffff00,
      );
      //this.addChild(this.boundingBox);

      this.boundingBox.visible = false;
    }
    if (configData && configData.url) {
      this.showImage(configData.url, configData.toAddDate);
    }
  }
  public setInteractive(flag: boolean): void {
    this.interactive = flag;
    this.interactiveChildren = false;
    if (this.sp) {
      this.sp.interactive = flag;
    }
  }

  public async cleanUpGPU() {
    if (this.imageURL) {
      try {
        if (Assets.cache.get(this.imageURL)) {
          await Assets.unload(this.imageURL);
        }
      } catch (e) {}
    }
    if (this.sp) {
      this.sp.destroy();
      this.sp = null;
    }
  }

  public destroyImageCache(): void {
    this.isDestroyed = true;
    if (this.sp) {
      this.sp.destroy();
      this.sp = null;
    }
  }
  async showImage(image: string, toAddDate: boolean = true, showLoader: boolean = false): Promise<void> {
    if (image == undefined) {
      return;
    }
    if (this.sp) {
      this.removeChild(this.sp);
      this.sp.destroy();
      this.sp = null;
    }
    let texture;
    toAddDate = false;
    /*try {
      if (toAddDate) {
        this.imageURL = `${image}?date=${Date.now()}`;
        texture = await Assets.load(this.imageURL);
      } else {
        texture = await Assets.load(image)
          .then(texture => {
            // Success
            console.log("success == ", image);
          })
          .catch(error => {
            console.error('Load failed:', image, error);

            // Check for CORS-specific hints
            if (
              error instanceof Error &&
              error.message.includes('cross-origin') ||
              error.message.includes('CORS') ||
              error.message.includes('tainted')
            ) {
              console.warn('Likely a CORS error');
            }
          });
      }
    } catch (e: any) {
      console.log('image load error == ', e);
      if (this.configData.failureCallback != undefined) {
        this.configData.failureCallback();
      }
      //console.warn('Image loading failure == ', image, e);
    }*/
    this.imageURL = image;
    if (toAddDate) {
      texture = await Assets.load(`${image}?date=${Date.now()}`);
    } else {
      await Assets.load(image)
        .then((tex) => {
          texture = tex;
        })
        .catch((error) => {
          console.warn('Load failed:', image);
          // Check for CORS-specific hints
          if (
            (error instanceof Error && error.message.includes('cross-origin')) ||
            error.message.includes('CORS') ||
            error.message.includes('tainted')
          ) {
            console.warn('Likely a CORS error -- ', error);
          } else {
            if (this.configData.failureCallback != undefined) {
              this.configData.failureCallback();
            }
          }
        });
    }
    if (!this.configData.dontDestroy) {
      if (GameProxy.config.imageHolder) {
        if (GameProxy.config.imagesArray.indexOf(this.imageURL) == -1) {
          GameProxy.config.imagesArray.push(this.imageURL);
          GameProxy.config.imageHolder.push(this);
        }
      }
    } else {
    }

    if (this.isDestroyed) {
      return;
    }
    if (texture) {
      this.sp = new PixSprite(texture);
      if (this.configData.anchor) {
        try {
          this.sp.anchor.x = this.configData.anchor.x;
          this.sp.anchor.y = this.configData.anchor.y;
          if (this.boundingBox) {
            this.boundingBox.x = -this.boundingBox.width * 0.5;
            this.boundingBox.y = -this.boundingBox.height * 0.5;
          }
        } catch (e) {}
      }
      this.addChild(this.sp);
      this.onImageLoaded();
    }
    if (this.lastImage) {
      //Assets.unload(this.lastImage);
    }
    this.lastImage = image;
  }

  setAnchor(x: number, y: number) {
    //this.sp.anchor.set(x, y);
  }

  onImageLoaded() {
    if (this.configData.boundingRect) {
      this.sp.scale.set(1);
      if (this.configData.boundingRect.isForced) {
        this.sp.width = this.configData.boundingRect.width;
        this.sp.height = this.configData.boundingRect.height;
      } else {
        const ws = this.configData.boundingRect.width / this.sp.width;
        const hs = this.configData.boundingRect.height / this.sp.height;
        this.sp.scale.set(Math.min(ws, hs));
      }

      if (this.children.length > 2) {
        this.removeChild(this.children[0]);
      }
    }
    this.emit('IMAGE_LOADED');
  }
  public removeImage(): void {
    if (this.sp) {
      this.removeChild(this.sp);
      this.sp.destroy();
      this.sp = null;
    }
  }

  updateImage(configData: any, toAddDate: boolean = false, showLoader: boolean = false) {
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
    if (this.configData?.boundingRect) {
      if (this.boundingBox) {
        this.boundingBox.width = this.configData.boundingRect.width;
        this.boundingBox.height = this.configData.boundingRect.height;
      } else {
        this.boundingBox = UIUtil.getRectangle(
          this.configData.boundingRect.width,
          this.configData.boundingRect.height,
          0xffff00,
        );
      }
      //this.addChild(this.boundingBox);

      this.boundingBox.visible = false;
    }
    if (configData && configData.url) {
      this.showImage(configData.url, toAddDate, showLoader);
    }
  }

  public getWidth(): number {
    if (this.boundingBox) {
      return this.boundingBox.width * this.scale.x;
    } else {
      return this.width;
    }
  }
  public getHeight(): number {
    if (this.boundingBox) {
      return this.boundingBox.height * this.scale.y;
    } else {
      return this.height;
    }
  }
}
