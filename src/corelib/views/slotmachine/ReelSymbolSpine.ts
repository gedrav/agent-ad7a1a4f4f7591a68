import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { SymbolConfig } from './ReelSymbol';
import { SpinePool } from './SpinePool';
import { AnimationStateListener } from '@esotericsoftware/spine-pixi-v8';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

export default class ReelSymbolSpine extends ReelSymbolSprite {
  protected animState: string;
  private readonly pool: SpinePool = SpinePool.getInstance();
  private animCompleteListener: AnimationStateListener | null = null;
  protected spineAnimCompleteCallback: () => void;
  constructor(configData: SymbolConfig) {
    super(configData);
  }

  // -------------------------
  // Setup & teardown
  // -------------------------
  public setNewSymbol(data: any, reelno: number): void {
    this.destroySpine();
    super.setNewSymbol(data, reelno);
  }

  protected createExtraElements(): void {
    this.destroySpine();
    if (!appModel.secondaryAssetsLoaded) return;
    if (!this.configData.data.spineName) return;
    this.spine = this.pool.acquire(this.configData.data);
    this.spine.stopAnimation();
    if (this.configData.data.animScale) {
      this.spine.scale.set(this.configData.data.animScale);
    }
    this.animCompleteListener = this.spine.addEventListener('complete', this.onAnimComplete.bind(this));
    this.addChild(this.spine);
    this.setSpineVisible(false);
  }

  protected destroySpine(): void {
    this.symbol.visible = true;
    super.cleanUpSymbolWin();

    if (!this.spine) return;

    if (this.animCompleteListener) {
      this.spine.removeSpineEvent(this.animCompleteListener);
      this.animCompleteListener = null;
    }

    this.removeChild(this.spine);
    this.pool.release(this.configData.data, this.spine);
    this.spine = null;
  }

  public recreateAnimation(): void {
    this.destroySpine();
    this.createExtraElements();
  }
  public showLanding() {
    if (!appModel.secondaryAssetsLoaded) {
      return;
    }
    if (this.configData.data.landingAnim) {
      this.playSpineAnimation(this.configData.data.landingAnim, false);
    }
  }
  public resetSymbol(): void {
    super.resetSymbol();
    this.destroySpine();
  }

  // -------------------------
  // Animations
  // -------------------------

  public showIdle(): void {
    if (!appModel.secondaryAssetsLoaded) {
      return;
    }
    if (this.configData.data.idleAnim) {
      if (this.configData.data.idleAnim === 'none') {
        // dont play idle anim for some reason
      } else {
        this.playSpineAnimation(this.configData.data.idleAnim, false);
      }
    } else {
      //super.showIdle();
    }
  }

  public showFeatureTriggerAnimation(onComplete?: () => void, loop: boolean = false): void {
    this.showWinning(onComplete, loop);
  }

  public showWinning(onComplete?: () => void, loop: boolean = false): void {
    if (!appModel.secondaryAssetsLoaded) {
      super.showWinning(onComplete, loop);
      return;
    }
    if (this.configData.data.winAnim) {
      this.spineAnimCompleteCallback = onComplete;
      this.playSpineAnimation(this.configData.data.winAnim, loop);
      const name: string = this.configData.data.name ?? '';
    } else {
      super.showWinning(onComplete);
    }
  }

  public cleanUpSymbolWin(): void {
    super.cleanUpSymbolWin();
    this.destroySpine();
  }

  // -------------------------
  // Helpers
  // -------------------------

  protected playSpineAnimation(state: string, loop: boolean): void {
    if (!this.spine) {
      this.createExtraElements();
    }
    this.animState = state;
    this.setSpineVisible(true);
    if (this.configData.data.skin) {
      this.spine.setSkin(this.configData.data.skin);
    }
    this.spine.playAnimation({ state, loop });
  }
  public clearCallBackAnimation() {
    this.spineAnimCompleteCallback = null;
    if (!this.spine) return;
    this.spine.stopAnimation();
    this.spine.visible = false;
    this.destroySpine();
  }
  protected onAnimComplete(data: { loop: boolean; animation: { name: string } }): void {
    if (data.loop) {
      return;
    }
    const isCurrentAnim = data.animation.name === this.animState;
    const isWinAnim = this.animState?.toLowerCase().includes('win');
    const isBlastAnim = this.animState?.toLowerCase().includes(this.configData.data.blastAnim);
    const callback = this.spineAnimCompleteCallback;
    this.spineAnimCompleteCallback = null;
    if (!this.spine) return;
    this.spine.stopAnimation();
    this.spine.visible = false;
    this.destroySpine();
    if (callback) {
      callback();
    }
  }
}
