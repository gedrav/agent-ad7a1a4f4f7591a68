import { Texture } from 'pixi.js';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { JCBonusSymbolModifier, ROOT_TEXT_SLOT_NAME } from './JCBonusSymbolModifier';
import { JCMysterySymbolModifier } from './JCMysterySymbolModifier';
import { JCBlanksSymbolModifier } from './JCBlanksSymbolModifier';

const BONUS_SYMBOL_PREFIX = 'cor-';
const MYSTERY_SYMBOL_NAMES = ['mystery', 'mystery jackpot'];
const BLANKS_SYMBOL_NAME = 'Blanks';

// Spine-only reel symbol (Blanks aside), driven by per-symbol data in SymbolsConfig. Symbols
// needing more than a single spine delegate to their own modifiers.
export default class JCReelSymbol extends ReelSymbolSpineExtended {
  // `declare` matters: createSymbol() runs during the super() chain and may init these before
  // this class's field initializers, which useDefineForClassFields would otherwise reset.
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

  private syncBlanksVisual(): void {
    if (this.isBlanksSymbol()) {
      this.blanksModifier.create(this.configData.data.row);
    } else {
      this.blanksModifier.destroy();
    }
  }

  // For a symbol already on screen rather than one being placed. No-op for non-Blanks.
  public refreshBlanksVisual(): void {
    this.syncBlanksVisual();
  }

  // The spine has to be rebuilt here too: a pooled instance reused for a different symbol needs
  // a different rig, and the inherited setNewSymbol() only swaps configData.
  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.createSymbol();
  }

  // this.symbol is spine-backed, though corelib types it as PixSprite. The inherited paths that
  // touch sprite-only props are ones this game never exercises, so the cast below is safe.
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

  // The inherited destroySymbol() won't cascade into the spine's GPU resources, so every
  // setNewSymbol() would leak a skeleton+atlas without this.
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

  // The real visual is the spine, so this stays empty and inherited .texture writes are no-ops.
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

  // ReelSymbolSpineExtended.onAnimComplete always falls back to showStatic() after a non-looping
  // animation, stomping whatever a completion callback just started (landing -> idle) in the same
  // tick. Skip that override and call its parent, so the fallback only fires when nothing else
  // decided what plays next.
  protected onAnimComplete(data: { loop: boolean; animation: { name: string } }): void {
    const hadCallback = !!this.spineAnimCompleteCallback;
    (ReelSymbolSpine.prototype as any).onAnimComplete.call(this, data);
    if (!data.loop && !hadCallback) {
      this.showStatic();
    }
  }

  protected setSpineVisible(flag: boolean): void {
    super.setSpineVisible(flag);
    this.mysteryModifier.setVisible(flag);
  }
}
