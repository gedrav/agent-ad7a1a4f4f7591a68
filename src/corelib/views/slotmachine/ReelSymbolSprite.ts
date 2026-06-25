import { ColorMatrixFilter } from 'pixi.js';
import ReelSymbol, { SymbolConfig } from '@core/views/slotmachine/ReelSymbol';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Util } from '@core/utils/UtilService';
import { Sine } from 'gsap';
import { GlowFilter } from 'pixi-filters';
interface GlowConfig {
  distance: number;
  outerStrength: number;
  innerStrength: number;
  color: number;
  quality: number;
}

const DEFAULT_GLOW_CONFIG: GlowConfig = {
  distance: 2,
  outerStrength: 1,
  innerStrength: 1,
  color: 0xffc600,
  quality: 0.5,
};

const ANIMATED_GLOW_TARGET = {
  duration: 0.5,
  distance: 50,
  outerStrength: 20,
  yoyo: true,
  repeat: -1,
};

export default class ReelSymbolSprite extends ReelSymbol {
  private activeGlowFilter: GlowFilter | null = null;
  private winningTimeoutId: any = null;

  constructor(configData: SymbolConfig) {
    super(configData);
    this.createSymbol();
  }

  // -------------------------
  // Setup
  // -------------------------

  protected createSymbol(): void {
    this.destroySymbol();

    this.symbol = UIUtil.getSprite(this.configData.data.name);
    this.symbol.label = 'SYMBOL';
    this.symbol.anchor.set(0.5, 0.5);
    this.symbol.scale.set(this.getDefaultScale());
    this.addChild(this.symbol);

    this.handleGameProp();
  }

  protected handleGameProp(): void {}

  public destroySymbol(): void {
    if (this.winningTimeoutId !== null) {
      clearTimeout(this.winningTimeoutId);
      this.winningTimeoutId = null;
    }
    if (this.activeGlowFilter) {
      AnimationProxy.killTweensOf(this.activeGlowFilter);
      this.activeGlowFilter.destroy?.();
      this.activeGlowFilter = null;
    }
    this.symbol?.destroy();
  }

  // -------------------------
  // Symbol identity
  // -------------------------

  public getSymbolName(): string {
    return this.configData.data.name;
  }

  public getSymbolNameForPayout(): string {
    const name = this.getSymbolName();
    return name.includes('_') ? name.split('_')[0] : name;
  }

  public getReelNumber(): number {
    return this.configData.data.reelNumber;
  }

  // -------------------------
  // Texture management
  // -------------------------

  public setNewSymbol(data: any, reelno: number): void {
    this.configData.data = { reelNumber: reelno, ...data };
    this.symbol.texture = this.resolveTexture();
    this.symbol.scale.set(this.getDefaultScale());
    this.handleGameProp();
  }

  public setBlurredTexture(): void {
    if (this.symbol && !this.isBlurred) {
      this.isBlurred = true;
      this.symbol.texture = this.resolveTexture();
    }
  }

  public setNormalTexture(): void {
    if (this.symbol && this.isBlurred) {
      this.isBlurred = false;
      this.symbol.texture = this.resolveTexture();
    }
  }

  // -------------------------
  // Animations
  // -------------------------

  public showIdle(): void {
    AnimationProxy.killTweensOf(this.symbol);
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.45,
      rotation: Util.getRadians(Util.getRandomRange(0, 1) === 0 ? -10 : 10),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    });
  }

  public stopIdleAnim(): void {
    AnimationProxy.killTweensOf(this.symbol);
    this.resetSymbol();
  }

  public showFaded(): void {
    this.symbol.tint = 0x666666;
  }

  public showFeatureTriggerAnimation(onComplete?: () => void): void {
    this.applyGlowAnimation({ innerStrength: 30 });
  }

  public showWinning(onComplete?: () => void): void {
    //this.applyGlowAnimation({ innerStrength: 2 });
    this.symbol.tint = 0xffffff;
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.5,
      scaleX: 1.1,
      scaleY: 1.1,
      repeat: -1,
      yoyo: true,
    });
    if (this.winningTimeoutId !== null) {
      clearTimeout(this.winningTimeoutId);
    }
    this.winningTimeoutId = setTimeout(() => {
      this.winningTimeoutId = null;
      onComplete?.();
    }, 2000);
  }

  public cleanUpSymbolWin(): void {
    if (this.winningTimeoutId !== null) {
      clearTimeout(this.winningTimeoutId);
      this.winningTimeoutId = null;
    }
    this.disposeGlowFilter();
    this.symbol.tint = 0xffffff;
    AnimationProxy.killTweensOf(this.symbol);
    this.symbol.scale.set(this.getDefaultScale());
  }

  private disposeGlowFilter(): void {
    if (this.activeGlowFilter) {
      AnimationProxy.killTweensOf(this.activeGlowFilter);
      this.symbol.filters = null;
      this.activeGlowFilter.destroy?.();
      this.activeGlowFilter = null;
    } else {
      this.symbol.filters = null;
    }
  }

  public showBlastAnim(onComplete?: () => void): void {
    AnimationProxy.animateTween(this.symbol.scale, {
      duration: 0.8,
      x: 0,
      y: 0,
      ease: Sine.easeOut,
      delay: 0.1,
      onComplete: () => onComplete?.(),
    });
  }

  public showAppearingAnim(data: any, column: number, callback: () => void): void {
    this.setNewSymbol(data, column);
    this.symbol.alpha = 0;
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.5,
      alpha: 1,
      onComplete: () => callback?.(),
    });
  }

  public replaceSymbol(data: any, reelno: number, onComplete?: () => void): void {
    this.setNewSymbol(data, reelno);
    this.symbol.scale.set(0);
    this.symbol.visible = true;

    const scale = this.getDefaultScale();
    AnimationProxy.animateTween(this.symbol, {
      duration: 0.8,
      scaleX: scale,
      scaleY: scale,
      ease: Sine.easeOut,
      onComplete: () => onComplete?.(),
    });
  }

  public resetScale(): void {
    this.symbol.scale.set(this.getDefaultScale());
  }

  // -------------------------
  // Overridable hooks
  // -------------------------

  public showLanding(): void {}
  protected createExtraElements(): void {}
  public clearCallBackAnimation(): void {}

  // -------------------------
  // Helpers
  // -------------------------

  private applyGlowAnimation(overrides: Partial<GlowFilter>): void {
    this.disposeGlowFilter();
    this.symbol.scale.set(this.getDefaultScale());

    const glowFilter = new GlowFilter(DEFAULT_GLOW_CONFIG);
    this.activeGlowFilter = glowFilter;
    this.symbol.filters = [glowFilter];

    AnimationProxy.animateTween(glowFilter, {
      ...ANIMATED_GLOW_TARGET,
      ...overrides,
    });
  }

  private getDefaultScale(): number {
    return Util.getDefaultValue(this.configData.data.scale, 1);
  }
}
