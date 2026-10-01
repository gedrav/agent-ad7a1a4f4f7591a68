import { Texture } from 'pixi.js';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { JCBonusSymbolModifier, ROOT_TEXT_SLOT_NAME } from './JCBonusSymbolModifier';
import { JCMysterySymbolModifier, MysteryReelResult } from './JCMysterySymbolModifier';
import { JCBlanksSymbolModifier } from './JCBlanksSymbolModifier';
import { BLANK_SYMBOL_NAME, MYSTERY_SYMBOL_NAMES } from '../../config/SymbolsConfig';

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

  // The cash-value symbols are the ones carrying a multiplier label, which is a property of the
  // symbol rather than of its name - so this survives the backend renaming them.
  private isBonusSymbol(): boolean {
    return !!this.configData.data.multiplierTextConfig;
  }

  private isMysterySymbol(): boolean {
    return MYSTERY_SYMBOL_NAMES.includes(this.configData.data.name);
  }

  private isBlanksSymbol(): boolean {
    return this.configData.data.name === BLANK_SYMBOL_NAME;
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

  public spinMysteryReel(result: MysteryReelResult, bet: number, delayMs = 0): Promise<void> {
    if (!this.isMysterySymbol()) return Promise.resolve();
    return this.mysteryModifier.spinReel(result, bet, delayMs);
  }

  // Sets the mini reel turning with no result yet - it lands when spinMysteryReel() gives it one.
  public startMysteryReel(bet: number, delayMs = 0): void {
    if (!this.isMysterySymbol()) return;
    this.mysteryModifier.startSpin(bet, delayMs);
  }

  public stopMysteryReel(): void {
    if (!this.isMysterySymbol()) return;
    this.mysteryModifier.stopReel();
  }

  public isMysteryReelSpinning(): boolean {
    return this.isMysterySymbol() && this.mysteryModifier.isSpinning;
  }

  // Blanks has no blurAnim, so the inherited blur path can't reach it - its rig carries blur skins
  // of its own instead. No-op for non-Blanks.
  public setBlanksBlurred(flag: boolean): void {
    this.blanksModifier.setBlurred(flag);
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
    this.addLabel(this.symbol as any);
    this.addChild(this.symbol);
    this.handleGameProp();
    this.syncBlanksVisual();
  }

  // Each symbol has two rigs: this.symbol, built here, and corelib's pooled this.spine, built
  // lazily by the first playSpineAnimation - which then hides this.symbol in its favour. The label
  // goes on both, or a symbol reads blank until something animates it.
  private addLabel(target: PixSpine | null): void {
    const config = this.configData.data.labelTextConfig;
    if (!config || !target?.addSlotObject) return;
    target.addSlotObject(ROOT_TEXT_SLOT_NAME, UIUtil.getElement(config));
  }

  // The mystery mini reel runs its own text through the very slot the label sits in, so the
  // modifier takes the label off both rigs while the strip is up and puts it back when it goes.
  public setLabelVisible(flag: boolean): void {
    [this.symbol as any, this.spine].forEach((rig: PixSpine | null) => {
      if (!rig?.addSlotObject) return;
      if (flag) {
        if (!rig.getSlotObject(ROOT_TEXT_SLOT_NAME)) this.addLabel(rig);
        return;
      }
      const label: any = rig.getSlotObject(ROOT_TEXT_SLOT_NAME);
      rig.removeSlotObject(ROOT_TEXT_SLOT_NAME);
      // Detached, not destroyed, by the spine - and a fresh one is built on the way back.
      label?.destroy();
    });
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
    }
    // Not an else: the mystery rigs carry a root_txt slot of their own, so their label rides the
    // same path as MN/MR/MJ on top of the front spine the modifier just added.
    this.addLabel(this.spine);
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
