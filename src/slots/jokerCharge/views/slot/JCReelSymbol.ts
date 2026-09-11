import { Texture } from 'pixi.js';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { JCBonusSymbolModifier, ROOT_TEXT_SLOT_NAME } from './JCBonusSymbolModifier';
import { JCMysterySymbolModifier } from './JCMysterySymbolModifier';
import { JCBlanksSymbolModifier } from './JCBlanksSymbolModifier';

const BONUS_SYMBOL_PREFIX = 'cor-';
const MYSTERY_SYMBOL_NAMES = ['mystery', 'mystery jackpot'];
const BLANKS_SYMBOL_NAME = 'Blanks';

// Spine-only reel symbol (Blanks aside - see blanksModifier), backed by corelib's
// ReelSymbolSpineExtended and driven by per-symbol data in SymbolsConfig.ts.
//
// cor-Nx bonus symbols and mystery/mystery jackpot need rendering beyond a single spine, so they
// delegate to their own modifiers below instead of branching here.
export default class JCReelSymbol extends ReelSymbolSpineExtended {
  // Lazily created via the getters below. `declare` is needed because createSymbol() (called
  // during the super() chain) may init these before this class's own field initializers run;
  // without it, useDefineForClassFields would reset them back to undefined afterward.
  declare private _bonusModifier: JCBonusSymbolModifier;
  declare private _mysteryModifier: JCMysterySymbolModifier;
  declare private _blanksModifier: JCBlanksSymbolModifier;
  // Set around setBlurredTexture() below - skips rebuilding the bonus/mystery/label overlay while
  // merely showing the spin-blur placeholder, since that overlay (a gradient+drop-shadow Text, or
  // a second spine for mystery) is expensive to recreate and destroySpine() forces a full rebuild
  // on every recycle - recreating it dozens of times a second while a reel spins was tanking FPS.
  private skipOverlayOnCreate = false;

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
      this.blanksModifier.create(this.configData.data.row);
    } else {
      this.blanksModifier.destroy();
    }
  }

  // Re-checks the active-row/respin state for a symbol that's already on screen (as opposed to
  // one just being placed) - see HoldNWinReel.refreshBlanksVisual(). No-op for non-Blanks symbols.
  public refreshBlanksVisual(): void {
    this.syncBlanksVisual();
  }

  // setNewSymbol() reassigns configData.data to a different symbol's data but never used to
  // recreate this.symbol - only fine while it was an inert empty sprite. Now that it's spine-
  // backed (see createSymbol() below), it must be rebuilt here too, since a pooled instance
  // reused for a different symbol needs a different rig (e.g. bag_collect -> mystery_back).
  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.createSymbol();
  }

  // this.symbol is spine-backed for every real symbol (Blanks aside - see blanksModifier) rather
  // than an empty sprite, since JC symbols are spine-only anyway. corelib's ReelSymbol/
  // ReelSymbolSprite type this.symbol as PixSprite and touch sprite-only props on it
  // (texture/tint/anchor) in a few inherited paths JC never actually exercises (all real JC
  // symbols already have their own winAnim etc., so those fallbacks don't fire) - those become
  // harmless no-ops against a PixSpine, which is why the `as any` below is safe here.
  protected createSymbol(): void {
    this.destroySymbol();
    if (this.configData.data.spineName) {
      const spine = UIUtil.getSpineAnim(this.configData.data.spineName, this.configData.data);
      spine.stopAnimation();
      if (this.configData.data.animScale) {
        spine.scale.set(this.configData.data.animScale);
      }
      this.symbol = spine as any;
    } else {
      this.symbol = UIUtil.getSpriteFromTexture(Texture.EMPTY);
      this.symbol.anchor.set(0.5, 0.5);
    }
    this.symbol.label = 'SYMBOL';
    this.addChild(this.symbol);
    this.handleGameProp();
    this.syncBlanksVisual();
  }

  // Plain Container.destroy() (what the inherited destroySymbol() calls) doesn't cascade into a
  // PixSpine's own child Spine object/GPU resources without {children: true} - use PixSpine's own
  // thorough teardown first so recreating this.symbol on every setNewSymbol() doesn't leak a full
  // skeleton+atlas each time.
  public destroySymbol(): void {
    const symbol: any = this.symbol;
    if (symbol instanceof PixSpine) {
      symbol.destroySpine();
    }
    super.destroySymbol();
  }

  // Overridden to loop idle continuously (JokerCharge-specific); corelib's default is loop: false.
  public showIdle(): void {
    if (!appModel.secondaryAssetsLoaded) return;
    if (!this.configData.data.idleAnim || this.configData.data.idleAnim === 'none') return;
    this.playSpineAnimation(this.configData.data.idleAnim, true);
  }

  public setBlurredTexture(): void {
    this.skipOverlayOnCreate = true;
    super.setBlurredTexture();
    this.skipOverlayOnCreate = false;
  }

  // this.symbol's real visual is the spine built in createSymbol() above, not a texture - stays
  // empty so the inherited .texture assignments in a few corelib paths are harmless no-ops.
  protected resolveTexture(): Texture {
    return Texture.EMPTY;
  }

  protected createExtraElements(): void {
    super.createExtraElements();
    if (!this.spine || this.skipOverlayOnCreate) return;
    if (this.isBonusSymbol()) {
      this.bonusModifier.create(this.configData.data.name, this.configData.data.multiplierTextConfig);
    } else if (this.isMysterySymbol()) {
      this.mysteryModifier.create(this.configData.data.animScale);
    } else if (this.configData.data.labelTextConfig) {
      const label = UIUtil.getElement(this.configData.data.labelTextConfig);
      this.addSlotObject(ROOT_TEXT_SLOT_NAME, label);
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
