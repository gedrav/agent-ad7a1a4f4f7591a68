import { Texture } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { JCBonusSymbolModifier } from './JCBonusSymbolModifier';
import { JCMysterySymbolModifier } from './JCMysterySymbolModifier';
import { JCBlanksSymbolModifier } from './JCBlanksSymbolModifier';

const BONUS_SYMBOL_PREFIX = 'cor-';
const MYSTERY_SYMBOL_NAMES = ['mystery', 'mystery jackpot'];
const BLANKS_SYMBOL_NAME = 'Blanks';

// JokerCharge reel symbol. Backed by corelib's ReelSymbolSpine, which already implements the
// spinning/idle/win/landing state machine (image visible while spinning, spine visible + playing
// "idle"/"win"/"landing" otherwise) driven by configData.data - see SymbolsConfig.ts for the
// per-symbol data (image/spineName/skin/idleAnim/winAnim/landingAnim).
//
// Two symbol families need extra rendering beyond a single image+spine pair, so this class
// delegates to them instead of growing its own branches:
// - cor-Nx symbols share one "bonus_sym" spine and need the "N" multiplier overlaid as text.
// - mystery / mystery jackpot are rendered from two spines ("mystery_back" + "mystery_front")
//   played together.
export default class JCReelSymbol extends ReelSymbolSpine {
  // Lazily created (not field initializers): ReelSymbolSprite's constructor calls
  // createSymbol() as part of the super() chain, before this class's own field initializers
  // would run, so an eager `= new JCBlanksSymbolModifier(this)` here is still undefined the
  // first time createSymbol() needs it. `declare` keeps useDefineForClassFields from also
  // re-defining (and wiping back to undefined) whatever the getter assigned during that
  // mid-super-chain call, once this class's own field-init step runs after super() returns.
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

  // Blanks has no real art yet - createSymbol() runs once at construction, setNewSymbol() runs
  // on every reuse, so both need to stay in sync with whichever symbol currently occupies this
  // instance.
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

  // Multiple backend symbol names share one texture frame (all cor-Nx use "bonus_sym", mystery
  // and mystery jackpot both use "mystery_static"), so the frame name comes from data.image
  // rather than data.name. Blanks has no frame in symbols.json at all, so it renders nothing
  // here - see blanksModifier for its placeholder rectangle instead.
  protected createSymbol(): void {
    this.destroySymbol();
    const imageName = this.configData.data.image;
    this.symbol = imageName ? UIUtil.getSprite(imageName) : UIUtil.getSpriteFromTexture(Texture.EMPTY);
    this.symbol.label = 'SYMBOL';
    this.symbol.anchor.set(0.5, 0.5);
    this.symbol.scale.set(Util.getDefaultValue(this.configData.data.scale, 1.5));
    this.addChild(this.symbol);
    this.handleGameProp();
    this.syncBlanksVisual();
  }

  // corelib's ReelSymbolSpine plays the idle animation once (loop: false) by default. JokerCharge
  // wants idle anims to loop continuously, which is game-specific, so it's overridden here rather
  // than changed in corelib (shared by every other game).
  public showIdle(): void {
    if (!appModel.secondaryAssetsLoaded) return;
    if (!this.configData.data.idleAnim || this.configData.data.idleAnim === 'none') return;
    this.playSpineAnimation(this.configData.data.idleAnim, true);
  }

  protected resolveTexture(): Texture {
    const imageName = this.configData.data.image;
    if (!imageName) return Texture.EMPTY;
    const name = this.isBlurred ? `${imageName}_blur` : imageName;
    return UIUtil.getTexture(name);
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
