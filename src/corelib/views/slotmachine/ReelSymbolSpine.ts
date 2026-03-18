import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { SymbolConfig } from './ReelSymbol';
import { SpinePool } from './SpinePool';
import { AnimationStateListener } from '@esotericsoftware/spine-pixi-v8';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export default class ReelSymbolSpine extends ReelSymbolSprite {
  private animState: string;
  private readonly pool: SpinePool = SpinePool.getInstance();
  private animCompleteListener: AnimationStateListener | null = null;

  constructor(configData: SymbolConfig) {
    super(configData);
  }

  // -------------------------
  // Setup & teardown
  // -------------------------
  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.destroySpine();
  }

  protected createExtraElements(): void {
    this.destroySpine();
    if (!this.configData.data.spineName) return;
    this.spine = this.pool.acquire(this.configData.data);
    this.spine.stopAnimation();
    if (this.configData.data.animScale) {
      this.spine.scale.set(this.configData.data.animScale);
    }
    this.animCompleteListener = {
      complete: (entry) => this.onAnimComplete(entry),
    };
    this.spine.onSpineEvent(this.animCompleteListener);
    this.addChild(this.spine);
    this.setSpineVisible(false);
  }

  protected destroySpine(): void {
    this.symbol.visible = true;
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

  public resetSymbol(): void {
    super.resetSymbol();
    this.destroySpine();
  }

  // -------------------------
  // Animations
  // -------------------------

  public showIdle(): void {
    if (this.configData.data.idleAnim) {
      this.playSpineAnimation(this.configData.data.idleAnim, false);
    } else {
      super.showIdle();
    }
  }

  public showFeatureTriggerAnimation(): void {
    this.showWinning();
  }

  public showWinning(): void {
    if (this.configData.data.winAnim) {
      this.playSpineAnimation(this.configData.data.winAnim, true);
      const name: string = this.configData.data.name ?? '';
      if (/^H[1-4]$/i.test(name)) {
        EventHandler.dispatchEvent(`PLAY_SYMBOL_APPEAR_${name.toUpperCase()}`);
      } else if (name.toUpperCase().startsWith('L')) {
        EventHandler.dispatchEvent('PLAY_SYMBOL_APPEAR_L');
      }
    } else {
      super.showWinning();
    }
  }

  public cleanUpSymbolWin(): void {
    super.cleanUpSymbolWin();
    this.destroySpine();
  }

  // -------------------------
  // Helpers
  // -------------------------

  private playSpineAnimation(state: string, loop: boolean): void {
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

  protected onAnimComplete(data: { animation: { name: string } }): void {
    const isCurrentAnim = data.animation.name === this.animState;
    const isWinAnim = this.animState?.toLowerCase().includes('win');

    if (!isCurrentAnim || isWinAnim || !this.spine) return;

    this.spine.stopAnimation();
    this.setSpineVisible(false);
    this.destroySpine();
  }
}
