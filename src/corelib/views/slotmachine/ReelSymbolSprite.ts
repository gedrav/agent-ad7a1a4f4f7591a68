import { ColorMatrixFilter } from 'pixi.js';
import ReelSymbol from '@core/views/slotmachine/ReelSymbol';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Util } from '@core/utils/UtilService';
import { Sine } from 'gsap';
import { GlowFilter } from 'pixi-filters';
import { gsap } from 'gsap';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
export default class ReelSymbolSprite extends ReelSymbol {
  constructor(configData: any) {
    super(configData);
    this.createSymbol();
  }
  protected createSymbol(): void {
    this.destroySymbol();
    this.symbol = UIUtil.getSprite(this.configData.data.name);
    this.addChild(this.symbol);
    this.symbol.label = 'SYMBOL';
    this.symbol.anchor.set(0.5, 0.5);
    this.symbol.scale.set(Util.getDefaultValue(this.configData.data.scale, 1));
  }

  public getSymbolName(): string {
    return this.configData.data.name;
  }
  public getSymbolNameForPayout(): string {
    if (this.getSymbolName().indexOf('_') > -1) {
      const arr: string[] = this.getSymbolName().split('_');
      return arr[0];
    }
    return this.getSymbolName();
  }
  public getReelNumber(): number {
    return this.configData.data.reelNumber;
  }

  public showIdle(): void {
    AnimationProxy.killTweensOf(this.symbol);

    // --------- Tilt
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.45,
      rotation: Util.getRadians(Util.getRandomRange(0, 1) == 0 ? -10 : 10),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    });

    // //-------Hover Vibration
    // AnimationProxy.animateTween(this.symbol, 0.06, {
    //   x: '+=4',
    //   duration: 0.06,
    //   ease: 'sine.inOut',
    //   yoyo: true,
    //   repeat: 5,
    // });

    //-------Hover Bob
    //AnimationProxy.animateTween(this.symbol, 0.8, {y: '-=10', duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 2});

    //-------Breathing Pulse (Scale In/Out)
    //gsap.to(this.symbol.scale, { x: 1.1, y: 1.1, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1 });

    //--------Shake
    /*gsap.fromTo(this.symbol,{ rotation: Util.getRadians(-3) },
    { rotation: Util.getRadians(3), duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: 2,
         onComplete: () => {
           gsap.to(this.symbol, {
             rotation: 0,
             duration: 0.25,
             ease: 'power2.out',
           });
         },
       },
    );*/

    //--------Wiggle Rotation Loop
    // const originalRot = this.symbol.rotation;
    // gsap.to(this.symbol, {
    //   rotation: originalRot + Util.getRadians(3),
    //   duration: 0.2,
    //   ease: 'sine.inOut',
    //   yoyo: true,
    //   repeat: 2,
    //   onComplete: () => {
    //     gsap.to(this.symbol, {
    //       rotation: originalRot,
    //       duration: 0.25,
    //       ease: 'sine.out',
    //     });
    //   },
    // });

    //----------Breathing Glow
    /*gsap.to(this.symbol, {
      alpha: 0.55,
      duration: 0.6,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut',
    });*/
  }
  public stopIdleAnim(): void {
    AnimationProxy.killTweensOf(this.symbol);
    this.resetSymbol();
  }

  public setNewSymbol(data: any, reelno): void {
    for (const p in data) {
      this.configData.data[p] = data[p];
    }
    if (this.isBlurred) {
      this.symbol.texture = UIUtil.getTexture(this.configData.data.name + '_blur');
    } else {
      this.symbol.texture = UIUtil.getTexture(this.configData.data.name);
    }
  }
  public setBlurredTexture(): void {
    if (this.symbol) {
      if (!this.isBlurred) {
        this.isBlurred = true;
        this.symbol.texture = UIUtil.getTexture(this.configData.data.name + '_blur');
      }
    }
  }
  public setNormalTexture() {
    if (this.symbol) {
      if (this.isBlurred) {
        this.isBlurred = false;
        this.symbol.texture = UIUtil.getTexture(this.configData.data.name);
      }
    }
  }

  public showFaded(): void {
    const colorMatrixFilter = new ColorMatrixFilter();
    colorMatrixFilter.brightness(0.4, false);
    this.symbol.filters = [colorMatrixFilter];
  }

  public showFeatureTriggerAnimation(): void {
    this.symbol.filters = null;
    this.symbol.scale.set(Util.getDefaultValue(this.configData.data.scale, 1));
    const glowFilter = new GlowFilter({
      distance: 2,
      outerStrength: 1,
      innerStrength: 1,
      color: 0xffc600,
      quality: 0.5,
    });
    this.symbol.filters = [glowFilter];
    AnimationProxy.animateTween(glowFilter, {
      duration: 0.5,
      distance: 50,
      outerStrength: 20,
      innerStrength: 30,
      repeat: -1,
      yoyo: true,
    });
  }
  public showWinning(): void {
    this.symbol.filters = null;
    this.symbol.scale.set(Util.getDefaultValue(this.configData.data.scale, 1));
    const glowFilter = new GlowFilter({
      distance: 2,
      outerStrength: 1,
      innerStrength: 1,
      color: 0xffc600,
      quality: 0.5,
    });
    this.symbol.filters = [glowFilter];
    AnimationProxy.animateTween(glowFilter, {
      duration: 0.5,
      distance: 50,
      outerStrength: 20,
      innerStrength: 2,
      repeat: -1,
      yoyo: true,
    });
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.5,
      scaleX: 1.1,
      scaleY: 1.1,
      repeat: -1,
      yoyo: true,
    });
  }

  public cleanUpSymbolWin(): void {
    this.symbol.filters = null;
    AnimationProxy.killTweensOf(this.symbol);
    this.symbol.scale.set(Util.getDefaultValue(this.configData.data.scale, 1));
  }

  public showBlastAnim(onComplete?: () => void): void {
    AnimationProxy.animateTween(this.symbol.scale, {
      duration: 0.8,
      x: 0,
      y: 0,
      ease: Sine.easeOut,
      delay: 0.1,
      onComplete: () => {
        onComplete?.();
      },
    });
  }

  public replaceSymbol(symb: string, onComplete?: () => void) {
    this.swapSymbolTexture(symb);
    this.symbol.scale.set(0);
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.8,
      scaleX: 1,
      scaleY: 1,
      ease: Sine.easeOut,
      onComplete: () => {
        onComplete?.();
      },
    });
  }

  public destroySymbol(): void {
    if (this.symbol) {
      this.symbol.destroy();
    }
  }
}
