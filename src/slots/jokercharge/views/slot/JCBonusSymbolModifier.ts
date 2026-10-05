import { Container } from 'pixi.js';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import ReelSymbolSpineExtended from '@core/views/slotmachine/ReelSymbolSpineExtended';
import { MULTIPLIER_APPLY_COUNT_EASE } from '../../config/MultiplierBadgeConfig';

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

  constructor(private readonly host: ReelSymbolSpineExtended) {}

  // value is the backend's figure for the cell and wins where there is one; the name is the
  // fallback, for a symbol belonging to no held cell.
  public create(symbolName: string, textConfig: any, value?: number): void {
    this.destroy();
    if (!textConfig) return;
    const text = UIUtil.getElement(textConfig);
    text.anchor?.set(textConfig.anchor?.x ?? 0.5, textConfig.anchor?.y ?? 0.5);
    this.value = value ?? Number(symbolName.slice(BONUS_SYMBOL_PREFIX.length));
    text.text = this.format(this.value);
    this.text = text;
    this.holder = new Container();
    this.holder.label = 'bonusValueHolder';
    this.holder.addChild(text);
    this.host.addSlotObject(ROOT_TEXT_SLOT_NAME, this.holder);
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
      onUpdate: () => {
        text.text = this.format(target.value);
      },
      onComplete: () => {
        this.countTarget = null;
        // Set outright rather than left on the tween's last frame, which stops a hair short.
        text.text = this.format(finalValue);
        onComplete?.();
      },
    });
  }

  private format(value: number): string {
    return Util.formatCurrencyNoSymbol(value * appModel.getTotalBet());
  }

  public destroy(): void {
    if (this.countTarget) {
      AnimationProxy.killTweensOf(this.countTarget);
      this.countTarget = null;
    }
    // removeSlotObject only detaches, so the Text has to be destroyed here or every placement
    // leaves one behind.
    if (this.text) {
      AnimationProxy.killTweensOf(this.text);
      AnimationProxy.killTweensOf(this.text.scale);
    }
    // removeSlotObject only detaches, so the holder has to be destroyed here or every placement
    // leaves one behind.
    this.host.removeSlotObject(ROOT_TEXT_SLOT_NAME);
    this.holder?.destroy({ children: true });
    this.holder = null;
    this.text = null;
    this.value = 0;
  }
}
