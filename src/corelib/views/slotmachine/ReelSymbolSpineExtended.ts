import { Container } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';

export interface ExtendedSymbolData {
  name: string;
  reelNumber?: number;
  spineName?: string;
  skin?: string;
  animScale?: number;
  idleAnim?: string;
  staticAnim?: string;
  blurAnim?: string;
  winAnim?: string;
  landingAnim?: string;
}

export interface ExtendedSymbolConfig {
  data: ExtendedSymbolData;
}

export default class ReelSymbolSpineExtended extends ReelSymbolSpine {
  private readonly slotObjects: Map<string, Container> = new Map();

  protected destroySpine(): void {
    this.clearSlotObjects();
    super.destroySpine();
  }

  public showStatic(): void {
    const anim = this.configData.data.staticAnim;
    if (!anim || anim === 'none') return;
    this.playSpineAnimation(anim, false);
  }

  public setBlurredTexture(): void {
    if (!this.configData.data.blurAnim) {
      super.setBlurredTexture();
      return;
    }
    this.playSpineAnimation(this.configData.data.blurAnim, true);
  }

  public setNormalTexture(): void {
    if (!this.configData.data.blurAnim) {
      super.setNormalTexture();
      return;
    }
    this.destroySpine();
  }

  public showWinning(onComplete?: () => void, loop: boolean = false): void {
    if (!this.configData.data.winAnim) {
      onComplete?.();
      return;
    }
    super.showWinning(onComplete, loop);
  }

  public showLanding(onComplete?: () => void): void {
    if (!this.configData.data.landingAnim) {
      onComplete?.();
      return;
    }
    this.spineAnimCompleteCallback = onComplete;
    if (!this.playSpineAnimation(this.configData.data.landingAnim, false)) {
      this.spineAnimCompleteCallback = null;
      onComplete?.();
    }
  }

  // Updates configData.data.skin (what playSpineAnimation reads) and the live spine, if any.
  public setSkin(skin: string): void {
    this.configData.data.skin = skin;
    this.spine?.setSkin(skin);
  }

  public addSlotObject(slotName: string, container: Container, followAttachmentTimeline = false): void {
    if (!this.spine) return;
    this.removeSlotObject(slotName);
    this.spine.addSlotObject(slotName, container, { followAttachmentTimeline });
    this.slotObjects.set(slotName, container);
  }

  public removeSlotObject(slotName: string): void {
    const container = this.slotObjects.get(slotName);
    if (!container) return;
    this.spine?.removeSlotObject(slotName);
    container.destroy();
    this.slotObjects.delete(slotName);
  }

  public getSlotObject(slotName: string): Container | undefined {
    return this.slotObjects.get(slotName);
  }

  private clearSlotObjects(): void {
    for (const slotName of Array.from(this.slotObjects.keys())) {
      this.removeSlotObject(slotName);
    }
  }
}
