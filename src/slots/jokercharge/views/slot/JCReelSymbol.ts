import { Container, Texture } from 'pixi.js';
import { PixText } from '@core/pixiwrapper/PixText';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { getLineBet } from '../../models/JCLinesState';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { JCBonusSymbolModifier, ROOT_TEXT_SLOT_NAME } from './JCBonusSymbolModifier';
import { JCMysterySymbolModifier, MysteryReelResult } from './JCMysterySymbolModifier';
import { JCBlanksSymbolModifier } from './JCBlanksSymbolModifier';
import { JCSymbolRigPool } from './JCSymbolRigPool';
import { BLANK_SYMBOL_NAME, BOOST_SYMBOL_NAME, MYSTERY_SYMBOL_NAMES } from '../../config/SymbolsConfig';
import { getCellValue } from '../../models/JCSpinData';
import { MULTIPLIER_APPLY_COUNT_EASE } from '../../config/MultiplierBadgeConfig';
import { releaseSharedStyle, shareTextStyle, writeCountText } from '../comps/sharedText';

// Spine-only reel symbol (Blanks aside), driven by per-symbol data in SymbolsConfig. Symbols
// needing more than a single spine delegate to their own modifiers.
export default class JCReelSymbol extends ReelSymbolSpineExtended {
  // `declare` matters: createSymbol() runs during the super() chain and may init these before
  // this class's field initializers, which useDefineForClassFields would otherwise reset.
  declare private _bonusModifier: JCBonusSymbolModifier;
  declare private _mysteryModifier: JCMysterySymbolModifier;
  declare private _blanksModifier: JCBlanksSymbolModifier;

  // The label count-up runs on this, not on a display object, so teardown kills it by hand.
  private labelCountTarget: { value: number } | null = null;
  // In bet multiples. The cash symbols keep their own, in the modifier that draws them.
  private labelValue = 0;
  // The figure once a multiplier or a boost has changed it. corelib rebuilds the spine on its own
  // (cleanUpSymbolWin, recreateAnimation and the like), and the rebuild would otherwise go back to
  // the backend's figure - or to nothing, for a boost. Cleared when the instance takes a new symbol.
  private heldValue: number | null = null;
  // While the pool parks this instance: nothing it holds should start playing on the way in.
  private parking = false;

  private get bonusModifier(): JCBonusSymbolModifier {
    return (this._bonusModifier ??= new JCBonusSymbolModifier());
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

  private initialValue(data: any): number | undefined {
    if (data.name === BOOST_SYMBOL_NAME) return 0;
    if (this.isBonusSymbol()) return undefined;
    return getCellValue(data.reelNumber, data.row);
  }

  private isMysterySymbol(): boolean {
    return MYSTERY_SYMBOL_NAMES.includes(this.configData.data.name);
  }

  private isBlanksSymbol(): boolean {
    return this.configData.data.name === BLANK_SYMBOL_NAME;
  }

  // Hidden rather than destroyed when the cell is not Blanks: the strip draws a blank in roughly
  // every other cell, and rebuilding its rig costs the same as a symbol's.
  // The raw field, not the getter: a symbol that has never been Blanks should not build one.
  private syncBlanksVisual(): void {
    if (this.isBlanksSymbol()) {
      this.blanksModifier.create(this.configData.data.row);
      return;
    }
    this._blanksModifier?.setVisible(false);
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

  // A cash symbol already shows a figure and simply climbs; a jackpot symbol shows a word, so the
  // word gives way first.
  public applyMultiplier(multiplier: number, duration: number, onComplete?: () => void): void {
    if (this.isBonusSymbol()) {
      this.bonusModifier.applyMultiplier(multiplier, duration, onComplete);
    } else {
      this.applyMultiplierToLabel(multiplier, duration, onComplete);
    }
    // Both take the new figure up front and only animate towards it.
    this.heldValue = this.getCollectValue();
  }

  // Written to every rig carrying the label, not just the visible one - see labelRigs.
  private applyMultiplierToLabel(multiplier: number, duration: number, onComplete?: () => void): void {
    const value = this.labelValue;
    const labels = this.labelTexts();

    if (!value || !labels.length) {
      onComplete?.();
      return;
    }

    const finalValue = value * multiplier;
    this.labelValue = finalValue;
    const write = (amount: number, final = false): void => this.writeLabelFigure(labels, amount, final);
    write(value, true);

    const target = { value };
    this.labelCountTarget = target;
    AnimationProxy.animateTween(target, {
      duration,
      value: finalValue,
      ease: MULTIPLIER_APPLY_COUNT_EASE,
      onUpdate: () => write(target.value),
      onComplete: () => {
        this.labelCountTarget = null;
        // Set outright rather than left on the tween's last frame, which stops a hair short.
        write(finalValue, true);
        onComplete?.();
      },
    });
  }

  // A label carrying a figure no longer reads as its config says, so its key is dropped: a pooled
  // rig arriving with it is then rebuilt by addLabel rather than reused as is.
  private writeLabelFigure(labels: PixText[], amount: number, final = true): void {
    const text = Util.formatCurrencyNoSymbol(amount * getLineBet());
    labels.forEach((label) => {
      writeCountText(label, text, final);
      if (label.parent) (label.parent as any).labelKey = null;
    });
  }

  // A count-up left running past the symbol it belongs to would write into destroyed text.
  private killLabelCount(): void {
    this.labelTexts().forEach((label) => {
      AnimationProxy.killTweensOf(label);
      AnimationProxy.killTweensOf(label.scale);
    });
    if (!this.labelCountTarget) return;
    AnimationProxy.killTweensOf(this.labelCountTarget);
    this.labelCountTarget = null;
  }

  // In bet multiples: the backend's figure for the cell times whatever multiplier was spent on it.
  public getCollectValue(): number {
    return this.isBonusSymbol() ? this.bonusModifier.getValue() : this.labelValue;
  }

  public refreshFigure(): void {
    if (this.isBonusSymbol()) {
      this._bonusModifier?.refresh();
    } else if (this.heldValue != null && !this.labelCountTarget) {
      this.writeLabelFigure(this.labelTexts(), this.labelValue);
    }
  }

  // The boost's figure climbing by what one symbol gave it. No-op for anything without a figure.
  public addCollectValue(amount: number, duration: number, onComplete?: () => void): void {
    if (!this.isBonusSymbol()) {
      onComplete?.();
      return;
    }
    this.bonusModifier.addValue(amount, duration, onComplete);
    this.heldValue = this.getCollectValue();
  }

  // Fire and forget: trails arrive faster than it runs, and each one restarts it.
  public showCollect(): void {
    const collectAnim = this.configData.data.collectAnim;
    if (!collectAnim) return;
    this.spineAnimCompleteCallback = () => this.showIdle();
    if (!this.playSpineAnimation(collectAnim, false)) this.spineAnimCompleteCallback = null;
  }

  // Blanks has no blurAnim, so the inherited blur path can't reach it - its rig carries blur skins
  // of its own instead. No-op for non-Blanks.
  public setBlanksBlurred(flag: boolean): void {
    this.blanksModifier.setBlurred(flag);
  }

  // The spine has to be rebuilt here too: a pooled instance reused for a different symbol needs
  // a different rig, and the inherited setNewSymbol() only swaps configData.
  public setNewSymbol(data: any, reelno: number): void {
    // Before super: it builds the new symbol's spine, which reads this.
    this.heldValue = null;
    this._bonusModifier?.reset();
    super.setNewSymbol(data, reelno);
    this.createSymbol();
    // The rig is built after the spine super just set playing, so it would draw under it - and tick
    // - until something else hid it.
    if (this.spine?.visible) this.setSpineVisible(true);
  }

  // A strip neighbour hidden at rest: its looping pose and front rig would otherwise go on ticking
  // unseen. The next spin's blur brings both back - see setSpineVisible.
  public pauseWhileHidden(): void {
    (this.spine as any)?.setAutoUpdate?.(false);
    (this.symbol as any)?.setAutoUpdate?.(false);
    this._mysteryModifier?.setVisible(false);
  }

  // this.symbol is spine-backed, though corelib types it as PixSprite. The inherited paths that
  // touch sprite-only props are ones this game never exercises, so the cast below is safe.
  protected createSymbol(): void {
    this.destroySymbol();
    if (this.configData.data.spineName) {
      this.symbol = JCSymbolRigPool.getInstance().acquire(this.configData.data) as any;
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

  // Every layer the label has to survive. this.symbol is built here and shows at rest; corelib's
  // pooled this.spine is built lazily by the first playSpineAnimation and hides this.symbol in its
  // favour; and a mystery adds a front rig over the top of that one. The label goes on all of
  // them, or the symbol reads blank in whichever state is not covered - blank at rest if it is
  // only on the pooled rig, and blank while spinning if the front rig covers the one carrying it.
  private labelRigs(): (PixSpine | null)[] {
    const rigs: (PixSpine | null)[] = [this.symbol as any, this.spine];
    // The raw field, not the getter: asking for the modifier would build one for every symbol.
    if (this._mysteryModifier) rigs.push(this._mysteryModifier.rig);
    return rigs;
  }

  // Spine overwrites a slot object's whole transform and alpha every frame, so the text goes
  // inside a holder rather than being the slot object itself.
  //
  // Keyed on the words themselves: a pooled rig arrives still carrying the last symbol's label, and
  // building a Text rasterises a texture, so one is only built when it would read differently.
  // mystery_back is the rig that needs it - MY and MJP share it and do not share a label.
  private addLabel(target: PixSpine | null): void {
    const config = this.configData.data.labelTextConfig;
    if (!target?.addSlotObject) return;
    const existing: any = target.getSlotObject(ROOT_TEXT_SLOT_NAME);
    if (existing && existing.labelKey === config?.content) return;
    if (existing) this.clearLabel(target);
    if (!config) return;
    const holder: any = new Container();
    holder.label = 'labelHolder';
    holder.labelKey = config.content;
    const label = UIUtil.getElement(config);
    shareTextStyle(label, config.style);
    holder.addChild(label);
    target.addSlotObject(ROOT_TEXT_SLOT_NAME, holder);
  }

  private clearLabel(target: PixSpine | null): void {
    const holder: any = target?.getSlotObject?.(ROOT_TEXT_SLOT_NAME);
    if (!holder) return;
    target.removeSlotObject(ROOT_TEXT_SLOT_NAME);
    holder.children.forEach((child: any) => releaseSharedStyle(child));
    // Detached, not destroyed, by the spine.
    holder.destroy({ children: true });
  }

  private labelTextOf(rig: PixSpine | null): PixText | null {
    const holder: any = rig?.getSlotObject?.(ROOT_TEXT_SLOT_NAME);
    return (holder?.children?.[0] as PixText) ?? null;
  }

  private labelTexts(): PixText[] {
    return this.labelRigs()
      .map((rig) => this.labelTextOf(rig))
      .filter((label): label is PixText => !!label);
  }

  // The mystery mini reel runs its own text through the very slot the label sits in, so the
  // modifier takes the label off both rigs while the strip is up and puts it back when it goes.
  public setLabelVisible(flag: boolean): void {
    this.labelRigs().forEach((rig: PixSpine | null) => {
      if (!rig?.addSlotObject) return;
      if (flag) {
        this.addLabel(rig);
        return;
      }
      this.clearLabel(rig);
    });
  }

  // The rig goes back to the pool rather than being destroyed - see JCSymbolRigPool. Nulled first
  // so the inherited destroySymbol(), which would destroy() it outright, leaves it alone. Its label
  // goes with it: addLabel keeps it for the next symbol that reads the same, or replaces it.
  public destroySymbol(): void {
    this.killLabelCount();
    const symbol: any = this.symbol;
    if (symbol instanceof PixSpine) {
      JCSymbolRigPool.getInstance().release(symbol);
      this.symbol = null;
    }
    super.destroySymbol();
  }

  // Overridden to loop idle continuously (JokerCharge-specific); corelib's default is loop: false.
  public showIdle(): void {
    if (!appModel.secondaryAssetsLoaded) return;
    if (!this.configData.data.idleAnim || this.configData.data.idleAnim === 'none') return;
    this.playSpineAnimation(this.configData.data.idleAnim, true);
  }

  // The counterpart to the inherited showLanding(), for the one animation only the mystery rigs
  // carry. playSpineAnimation forwards to the modifier, so the front layer hides along with it.
  public showHiding(onComplete?: () => void): void {
    const hideAnim = this.configData.data.hideAnim;
    if (!hideAnim) {
      onComplete?.();
      return;
    }
    // The landed prize is drawn over the symbol, so no animation of the rig's can take it away.
    // The raw field, not the getter: asking for the modifier would build one for every symbol.
    this._mysteryModifier?.clearResultLabel();
    this.spineAnimCompleteCallback = onComplete;
    if (!this.playSpineAnimation(hideAnim, false)) {
      this.spineAnimCompleteCallback = null;
      onComplete?.();
    }
  }

  // The real visual is the spine, so this stays empty and inherited .texture writes are no-ops.
  protected resolveTexture(): Texture {
    return Texture.EMPTY;
  }

  protected createExtraElements(): void {
    super.createExtraElements();
    if (!this.spine) return;
    // reelNumber is the column - corelib writes it onto configData.data in setNewSymbol.
    const data = this.configData.data;
    const value = this.heldValue ?? this.initialValue(data);
    this.labelValue = value ?? 0;
    if (this.isBonusSymbol()) {
      this.bonusModifier.create(data.name, data.multiplierTextConfig, value, this.spine);
    } else if (this.isMysterySymbol()) {
      this.mysteryModifier.create(this.configData.data.animScale);
    }
    // Not an else: the mystery rigs carry a root_txt slot of their own, so their label rides the
    // same path as MN/MR/MJ, and on the front rig as well as the back, which covers it.
    this.labelRigs().forEach((rig) => this.addLabel(rig));
    // A rebuilt rig's label reads as its config says, which a multiplier has since overtaken.
    // Loose on purpose: the first build runs inside corelib's constructor, before this class's
    // fields are initialised, so heldValue is still undefined there rather than null.
    if (this.heldValue != null && !this.isBonusSymbol()) {
      this.writeLabelFigure(this.labelTexts(), this.labelValue);
    }
  }

  // The pool's release. resetSymbol() alone would pick a spine straight back up for showStatic and
  // leave it looping on the ticker for as long as the instance waits, and a completion callback
  // left by the last owner would answer for the next one.
  public park(): void {
    this.spineAnimCompleteCallback = null;
    this.parking = true;
    this.resetSymbol();
    this.parking = false;
    (this.symbol as any)?.setAutoUpdate?.(false);
  }

  public showStatic(): void {
    if (this.parking) return;
    super.showStatic();
  }

  // For an instance that is going for good (the pool's temporary ones): its pooled spine, its rig
  // and its modifiers all go back or go away first, which destroy() on its own would skip.
  public destroyView(): void {
    this.park();
    this.destroySymbol();
    this._bonusModifier?.destroy();
    this._blanksModifier?.destroy();
    super.destroyView();
  }

  protected destroySpine(): void {
    this.killLabelCount();
    // Raw fields: destroying through the getters would build a modifier for every symbol only to
    // tear it straight down again.
    // Kept for the next rig, only taken off this one before it goes back to its pool.
    this._bonusModifier?.detach();
    this._mysteryModifier?.destroy();
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
    // corelib detaches the spine it hides, but not the rig it hid it for - an invisible rig would
    // otherwise go on ticking a skeleton every frame, once per cell.
    (this.symbol as any)?.setAutoUpdate?.(!flag);
    // The raw field, not the getter: asking for the modifier would build one for every symbol.
    this._mysteryModifier?.setVisible(flag);
  }
}
