import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { MULTIPLIER_APPLY_COUNT_EASE } from '../../config/MultiplierBadgeConfig';
import { releaseSharedStyle, shareTextStyle, writeCountText } from '../comps/sharedText';

const BONUS_SYMBOL_PREFIX = 'C';
// Shared with JCReelSymbol's static label handling (MN/MR/MJ) - both hat and belt/boot/mask rigs
// have this same placeholder slot.
export const ROOT_TEXT_SLOT_NAME = 'root_txt';

// Overlays a CN bonus symbol's cash value, attached to the hat rig's root_txt placeholder slot so
// it follows the symbol's own spine animation. The figure it holds is a bet multiplier.
export class JCBonusSymbolModifier {
  // Spine overwrites a slot object's whole transform and alpha every frame, so the text goes
  // inside this rather than being the slot object itself.
  private holder: Container | null = null;
  private text: PixText | null = null;
  // In bet multiples, the units the backend sends - never the money on screen.
  private value = 0;
  // The count-up runs on this, not on a display object, so teardown has to kill it by hand.
  private countTarget: { value: number } | null = null;
  // Callers of addValue() still waiting: an add that lands mid-climb takes the climb over, and the
  // one it replaced would otherwise never call back.
  private pendingAdds: (() => void)[] = [];
  // The style the current Text was built with. C1 to C4 share one, C5 has its own, so only that
  // boundary needs a rebuild.
  private styleRef: any = null;
  // The rig the holder rides on right now. The holder is put straight on the rig rather than through
  // the host's slot map, which destroys whatever it holds whenever the host rebuilds its spine.
  private rig: PixSpine | null = null;

  // value is the backend's figure for the cell and wins where there is one; the name is the
  // fallback, for a symbol belonging to no held cell.
  // Called again every time the host's rig is rebuilt, which on a moving strip is a few times a
  // second per cell, so the Text is kept and rewritten rather than built afresh - building one
  // clones its config and makes new gradients. Only the slot attachment is redone, the rig being new.
  public create(symbolName: string, textConfig: any, value: number | undefined, rig: PixSpine): void {
    if (!textConfig) {
      this.destroy();
      return;
    }
    if (this.text && textConfig.style !== this.styleRef) {
      this.destroy();
    }
    if (!this.text) {
      const text = UIUtil.getElement(textConfig);
      text.anchor?.set(textConfig.anchor?.x ?? 0.5, textConfig.anchor?.y ?? 0.5);
      shareTextStyle(text, textConfig.style);
      this.text = text;
      this.styleRef = textConfig.style;
      this.holder = new Container();
      this.holder.label = 'bonusValueHolder';
      this.holder.addChild(text);
    }
    // A count still running carries on into the new rig - it already holds the figure it ends on.
    if (!this.countTarget) {
      this.value = value ?? Number(symbolName.slice(BONUS_SYMBOL_PREFIX.length));
      this.show(this.value);
    }
    this.detach();
    rig.addSlotObject(ROOT_TEXT_SLOT_NAME, this.holder);
    this.rig = rig;
  }

  // Off the rig, ahead of it going back to its pool. The Text is kept for the next rig.
  public detach(): void {
    if (!this.rig) return;
    this.rig.removeSlotObject(ROOT_TEXT_SLOT_NAME);
    this.rig = null;
  }

  // The instance is taking another symbol: whatever this one was counting no longer applies.
  public reset(): void {
    this.killCount();
    this.detach();
    this.value = 0;
  }

  // Nothing shows at zero: a boost starts empty and fills as it collects.
  private show(value: number, final = true): void {
    if (!this.text) return;
    writeCountText(this.text, this.format(value), final);
    this.text.visible = value > 0;
  }

  // The figure climbs by amount from whatever it is showing, so adds that overlap all land.
  public addValue(amount: number, duration: number, onComplete?: () => void): void {
    if (!this.text) {
      onComplete?.();
      return;
    }
    if (onComplete) this.pendingAdds.push(onComplete);
    const from = this.countTarget?.value ?? this.value;
    if (this.countTarget) AnimationProxy.killTweensOf(this.countTarget);
    const finalValue = this.value + amount;
    this.value = finalValue;
    const target = { value: from };
    this.countTarget = target;

    AnimationProxy.animateTween(target, {
      duration,
      value: finalValue,
      ease: MULTIPLIER_APPLY_COUNT_EASE,
      onUpdate: () => this.show(target.value, false),
      onComplete: () => {
        this.countTarget = null;
        this.show(finalValue);
        const waiting = this.pendingAdds;
        this.pendingAdds = [];
        waiting.forEach((callback) => callback());
      },
    });
  }

  // In bet multiples, what the cell is worth now - the figure on screen, before the bet is applied.
  public getValue(): number {
    return this.value;
  }

  // The figure climbs to what the multiplier makes it worth, and the new value is kept.
  public applyMultiplier(multiplier: number, duration: number, onComplete?: () => void): void {
    const text = this.text;
    if (!text) {
      onComplete?.();
      return;
    }
    const target = { value: this.value };
    const finalValue = this.value * multiplier;
    this.countTarget = target;
    this.value = finalValue;

    AnimationProxy.animateTween(target, {
      duration,
      value: finalValue,
      ease: MULTIPLIER_APPLY_COUNT_EASE,
      onUpdate: () => this.show(target.value, false),
      onComplete: () => {
        this.countTarget = null;
        // Set outright rather than left on the tween's last frame, which stops a hair short.
        this.show(finalValue);
        onComplete?.();
      },
    });
  }

  private format(value: number): string {
    return Util.formatCurrencyNoSymbol(value * appModel.getTotalBet());
  }

  private killCount(): void {
    if (this.countTarget) {
      AnimationProxy.killTweensOf(this.countTarget);
      this.countTarget = null;
    }
    this.pendingAdds = [];
    if (this.text) {
      AnimationProxy.killTweensOf(this.text);
      AnimationProxy.killTweensOf(this.text.scale);
    }
  }

  public destroy(): void {
    this.killCount();
    this.detach();
    if (this.text) releaseSharedStyle(this.text);
    this.holder?.destroy({ children: true });
    this.holder = null;
    this.text = null;
    this.styleRef = null;
    this.value = 0;
  }
}
