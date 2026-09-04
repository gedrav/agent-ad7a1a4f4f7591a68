import { Texture } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { appModel } from '@core/models/services/AppModelService';
import { JCBonusSymbolModifier } from './JCBonusSymbolModifier';
import { JCMysterySymbolModifier } from './JCMysterySymbolModifier';
import { JCBlanksSymbolModifier } from './JCBlanksSymbolModifier';

const BONUS_SYMBOL_PREFIX = 'cor-';
const MYSTERY_SYMBOL_NAMES = ['mystery', 'mystery jackpot'];
const BLANKS_SYMBOL_NAME = 'Blanks';

// Spine-only reel symbol (Blanks aside - see blanksModifier), backed by corelib's ReelSymbolSpine
// and driven by per-symbol data in SymbolsConfig.ts.
//
// cor-Nx bonus symbols and mystery/mystery jackpot need rendering beyond a single spine, so they
// delegate to their own modifiers below instead of branching here.
export default class JCReelSymbol extends ReelSymbolSpine {
  // Lazily created via the getters below. `declare` is needed because createSymbol() (called
  // during the super() chain) may init these before this class's own field initializers run;
  // without it, useDefineForClassFields would reset them back to undefined afterward.
  declare private _bonusModifier: JCBonusSymbolModifier;
  declare private _mysteryModifier: JCMysterySymbolModifier;
  declare private _blanksModifier: JCBlanksSymbolModifier;

  private get bonusModifier(): JCBonusSymbolModifier {
    return (this._bonusModifier ??= new JCBonusSymbolModifier(this));
  }

  private get mysteryModifier(): JCMysterySymbolModifier {
    return (this._mysteryModifier ??= new JCMysterySymbolModifier(this));
  }

  private get blanksModifier(): JCBlanksSymbolModifier {
    return (this._blanksModifier ??= new JCBlanksSymbolModifier(this));
  }

  private isBonusSymbol(): boolean {
    return this.configData.data.name.startsWith(BONUS_SYMBOL_PREFIX);
  }

  private isMysterySymbol(): boolean {
    return MYSTERY_SYMBOL_NAMES.includes(this.configData.data.name);
  }

  private isBlanksSymbol(): boolean {
    return this.configData.data.name === BLANKS_SYMBOL_NAME;
  }

  // createSymbol() runs once at construction, setNewSymbol() on every reuse - both must stay in
  // sync with whatever symbol currently occupies this instance.
  private syncBlanksVisual(): void {
    if (this.isBlanksSymbol()) {
      this.blanksModifier.create();
    } else {
      this.blanksModifier.destroy();
    }
  }

  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.syncBlanksVisual();
  }

  // Base sprite stays empty - corelib's ReelSymbol/ReelSymbolSprite reference this.symbol
  // directly and assume it exists. Blanks is the exception - see blanksModifier.
  protected createSymbol(): void {
    this.destroySymbol();
    this.symbol = UIUtil.getSpriteFromTexture(Texture.EMPTY);
    this.symbol.label = 'SYMBOL';
    this.symbol.anchor.set(0.5, 0.5);
    this.addChild(this.symbol);
    this.handleGameProp();
    this.syncBlanksVisual();
  }

  // Overridden to loop idle continuously (JokerCharge-specific); corelib's default is loop: false.
  public showIdle(): void {
    if (!appModel.secondaryAssetsLoaded) return;
    if (!this.configData.data.idleAnim || this.configData.data.idleAnim === 'none') return;
    this.playSpineAnimation(this.configData.data.idleAnim, true);
  }

  // TODO: swap to dedicated static/staticBlur spine anims once that art exists; plays idle as a
  // placeholder for now.
  public setStaticAnimation(): void {
    this.showIdle();
  }

  // corelib's showLanding() takes no completion callback (unlike showWinning()); this mirrors
  // showWinning()'s spineAnimCompleteCallback pattern so callers can chain into showIdle() without
  // guessing at a delay. Falls back to firing immediately if landing can't actually play.
  public showLanding(onComplete?: () => void): void {
    if (!appModel.secondaryAssetsLoaded || !this.configData.data.landingAnim) {
      onComplete?.();
      return;
    }
    this.spineAnimCompleteCallback = onComplete;
    if (!this.playSpineAnimation(this.configData.data.landingAnim, false)) {
      this.spineAnimCompleteCallback = null;
      onComplete?.();
    }
  }

  // Always empty - see createSymbol() above.
  protected resolveTexture(): Texture {
    return Texture.EMPTY;
  }

  protected createExtraElements(): void {
    super.createExtraElements();
    if (!this.spine) return;
    if (this.isBonusSymbol()) {
      this.bonusModifier.create(this.configData.data.name, this.configData.data.multiplierTextConfig);
    } else if (this.isMysterySymbol()) {
      this.mysteryModifier.create(this.configData.data.animScale);
    }
  }

  protected destroySpine(): void {
    this.bonusModifier.destroy();
    this.mysteryModifier.destroy();
    super.destroySpine();
  }

  protected playSpineAnimation(state: string, loop: boolean): boolean {
    const played = super.playSpineAnimation(state, loop);
    if (played && this.isMysterySymbol()) {
      this.mysteryModifier.play(state, loop, this.configData.data.skin);
    }
    return played;
  }

  protected setSpineVisible(flag: boolean): void {
    super.setSpineVisible(flag);
    this.mysteryModifier.setVisible(flag);
  }
}
