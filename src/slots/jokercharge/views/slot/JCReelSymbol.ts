import { Container, Texture } from 'pixi.js';
import { PixText } from '@core/pixiwrapper/PixText';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { JCBonusSymbolModifier, ROOT_TEXT_SLOT_NAME } from './JCBonusSymbolModifier';
import { JCMysterySymbolModifier, MysteryReelResult } from './JCMysterySymbolModifier';
import { JCBlanksSymbolModifier } from './JCBlanksSymbolModifier';
import { BLANK_SYMBOL_NAME, MYSTERY_SYMBOL_NAMES } from '../../config/SymbolsConfig';
import { getCellValue } from '../../models/JCSpinData';
import { MULTIPLIER_APPLY_COUNT_EASE } from '../../config/MultiplierBadgeConfig';

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

  // A cash symbol already shows a figure and simply climbs; a jackpot symbol shows a word, so the
  // word gives way first.
  public applyMultiplier(multiplier: number, duration: number, onComplete?: () => void): void {
    if (this.isBonusSymbol()) {
      this.bonusModifier.applyMultiplier(multiplier, duration, onComplete);
      return;
    }
    this.applyMultiplierToLabel(multiplier, duration, onComplete);
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
    const write = (amount: number): void => {
      const text = Util.formatCurrencyNoSymbol(amount * appModel.getTotalBet());
      labels.forEach((label) => (label.text = text));
    };
    write(value);

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
        write(finalValue);
        onComplete?.();
      },
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

  // Idempotent: addSlotObject does not replace, so adding twice orphans the first Text on a slot
  // nothing will clear.
  // Spine overwrites a slot object's whole transform and alpha every frame, so the text goes
  // inside a holder rather than being the slot object itself.
  private addLabel(target: PixSpine | null): void {
    const config = this.configData.data.labelTextConfig;
    if (!config || !target?.addSlotObject) return;
    if (target.getSlotObject(ROOT_TEXT_SLOT_NAME)) return;
    const holder = new Container();
    holder.label = 'labelHolder';
    holder.addChild(UIUtil.getElement(config));
    target.addSlotObject(ROOT_TEXT_SLOT_NAME, holder);
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
      const holder: any = rig.getSlotObject(ROOT_TEXT_SLOT_NAME);
      rig.removeSlotObject(ROOT_TEXT_SLOT_NAME);
      // Detached, not destroyed, by the spine - and a fresh one is built on the way back.
      holder?.destroy({ children: true });
    });
  }

  // The inherited destroySymbol() won't cascade into the spine's GPU resources, so every
  // setNewSymbol() would leak a skeleton+atlas without this.
  public destroySymbol(): void {
    this.killLabelCount();
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
    this.labelValue = getCellValue(this.configData.data.reelNumber, this.configData.data.row) ?? 0;
    if (this.isBonusSymbol()) {
      // reelNumber is the column - corelib writes it onto configData.data in setNewSymbol.
      const data = this.configData.data;
      this.bonusModifier.create(data.name, data.multiplierTextConfig, getCellValue(data.reelNumber, data.row));
    } else if (this.isMysterySymbol()) {
      this.mysteryModifier.create(this.configData.data.animScale);
    }
    // Not an else: the mystery rigs carry a root_txt slot of their own, so their label rides the
    // same path as MN/MR/MJ, and on the front rig as well as the back, which covers it.
    this.labelRigs().forEach((rig) => this.addLabel(rig));
  }

  protected destroySpine(): void {
    this.killLabelCount();
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
